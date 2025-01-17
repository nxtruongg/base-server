import { IUserRequest } from '@/common/interfaces/user-request.interfaces';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { CacheService } from '@/cache/cache.service';
import { CacheKeyEnum } from '@/common/enums/cache-key.enums';
import { CrudEventEnum } from '@/common/enums/event.enums';
import { LogActionEnum } from '@/common/enums/log-action.enums';
import { ActivityLogService } from '@/modules/systems/activityLog/activityLog.service';

@Injectable()
export class BaseService<T> {
  @Inject(CacheService)
  private readonly cacheService: CacheService;

  @Inject(ActivityLogService)
  private readonly activityLogService: ActivityLogService;

  private readonly eventEmitter: EventEmitter2;

  constructor(@InjectModel('') private readonly model: Model<T>) {
    if (!model) {
      throw new InternalServerErrorException(
        'Model not injected properly in BaseService',
      );
    }
  }

  protected async beforeCreate(
    data: Partial<T>,
    user: IUserRequest,
  ): Promise<Partial<T>> {
    return data;
  }

  protected async afterCreate(entity: T, user: IUserRequest): Promise<void> {}

  protected async beforeUpdate(
    id: string,
    data: Partial<T>,
    user: IUserRequest,
  ): Promise<Partial<T>> {
    return data;
  }

  protected async afterUpdate(entity: T, user: IUserRequest): Promise<void> {}

  protected async beforeRemove(entity: T, user: IUserRequest): Promise<void> {}

  protected async afterRemove(entity: T, user: IUserRequest): Promise<void> {}

  protected async onView(data: T[], user: IUserRequest): Promise<T[]> {
    return data;
  }
  protected async onFinding(
    condition: FilterQuery<T> = {},
    user: IUserRequest,
  ): Promise<FilterQuery<T>> {
    return condition;
  }

  async create(data: Partial<T>, user: IUserRequest): Promise<T> {
    try {
      if (user?.userId) {
        data['createdBy'] = user.userId;
      }

      const processedData = await this.beforeCreate(data, user);
      const entity = new this.model(processedData);
      await entity.save();

      await this.afterCreate(entity, user);
      await this.logActivity(
        LogActionEnum.CREATE,
        entity._id.toString(),
        user,
        data,
      );
      await this.cacheService.delCache(
        `${this.model.collection.name}-${CacheKeyEnum.FIND_ALL}-*`,
      );
      this.eventEmitter.emit(`${this.model.modelName}.${CrudEventEnum.SAVED}`, {
        entity,
        user,
      });
      return entity;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: Partial<T>, user: IUserRequest): Promise<T> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    try {
      if (user?.userId) {
        data['updatedBy'] = user.userId;
      }

      const processedData = await this.beforeUpdate(id, data, user);
      const entity = await this.model
        .findByIdAndUpdate(id, processedData, { new: true })
        .exec();

      if (!entity) {
        throw new NotFoundException(`Entity with id ${id} not found`);
      }

      await this.afterUpdate(entity, user);
      await this.logActivity(LogActionEnum.UPDATE, id, user, data);
      await this.cacheService.delCache(
        `${this.model.collection.name}-${CacheKeyEnum.FIND_ONE}-${id}`,
      );
      await this.cacheService.delCache(
        `${this.model.collection.name}-${CacheKeyEnum.FIND_ALL}-*`,
      );
      this.eventEmitter.emit(`${this.model.modelName}.${CrudEventEnum.SAVED}`, {
        entity,
        user,
      });
      return entity;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, user: IUserRequest): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    try {
      const entity = await this.model.findById(id).exec();
      await this.beforeRemove(entity, user);

      const result = await this.model.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Entity with id ${id} not found`);
      }

      await this.afterRemove(entity, user);
      await this.logActivity(LogActionEnum.DELETE, id, user, entity);
      await this.cacheService.delCache(
        `${this.model.collection.name}-${CacheKeyEnum.FIND_ONE}-${id}`,
      );
      await this.cacheService.delCache(
        `${this.model.collection.name}-${CacheKeyEnum.FIND_ALL}-*`,
      );
      this.eventEmitter.emit(
        `${this.model.modelName}.${CrudEventEnum.DELETED}`,
        {
          entity,
          user,
        },
      );
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    filter: FilterQuery<T> = {},
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = {},
    user: IUserRequest,
  ): Promise<T[]> {
    const condition = await this.onFinding(filter, user);
    const cacheKey = `${this.model.collection.name}-${CacheKeyEnum.FIND_ALL}-${JSON.stringify(condition)}-${page}-${limit}-${JSON.stringify(sort)}`;
    const cachedResult = await this.cacheService.getCached(cacheKey);
    if (cachedResult) return cachedResult as any;

    const skip = (page - 1) * limit;

    try {
      console.time('1');
      const data = await this.model
        .find(condition)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .exec();
      console.timeEnd('1');
      const processedData = await this.onView(data, user);
      await this.cacheService.setCached(cacheKey, processedData);
      await this.logActivity(LogActionEnum.READ, '', user, condition);
      return processedData;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string, user: IUserRequest): Promise<T> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const cacheKey = `${this.model.collection.name}-${CacheKeyEnum.FIND_ONE}-${id}`;
    const cachedEntity = await this.cacheService.getCached<T>(cacheKey);

    if (cachedEntity) {
      return cachedEntity;
    }

    try {
      const entity = await this.model.findById(id).exec();
      if (!entity) {
        throw new NotFoundException(`Entity with id ${id} not found`);
      }
      await this.cacheService.setCached(cacheKey, entity);
      await this.logActivity(LogActionEnum.READ, id, user);
      const data = this.onView([entity], user);
      return data[0] ? data[0] : (data as T);
    } catch (error) {
      throw error;
    }
  }

  async search(
    query: string,
    page: number,
    limit: number,
    user: IUserRequest,
  ): Promise<T[]> {
    try {
      const filter = { $text: { $search: query } };
      const result = await this.findAll(filter, page, limit, {}, user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  protected async logActivity(
    action: LogActionEnum,
    documentId: string,
    user: IUserRequest,
    changes?: Partial<T>,
  ): Promise<void> {
    try {
      await this.activityLogService.logActivity(
        action,
        documentId,
        this.model.collection.name,
        user,
        changes,
      );
    } catch (error) {
      console.error('Create log system error', error);
    }
  }

  async softRemove(id: string, user: IUserRequest): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    try {
      const entity = await this.model
        .findByIdAndUpdate(
          id,
          { isDeleted: true, deletedBy: user.userId, deletedAt: new Date() },
          { new: true },
        )
        .exec();

      if (!entity) {
        throw new NotFoundException(`Entity with id ${id} not found`);
      }

      await this.logActivity(LogActionEnum.SOFT_DELETE, id, user);
    } catch (error) {
      throw new InternalServerErrorException('Error soft-deleting entity');
    }
  }
}
