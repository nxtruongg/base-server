import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog } from '@/database/schemas/activityLog.schema';
import { LogActionEnum } from '@/common/enums/log-action.enums';
import { IUserRequest } from '@/common/interfaces/user-request.interfaces';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLog>,
  ) {}

  async logActivity(
    action: LogActionEnum,
    documentId: string,
    collectionName: string,
    user?: IUserRequest,
    changes?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.activityLogModel.create({
        action,
        documentId,
        collectionName,
        timestamp: new Date(),
        user,
        changes,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}
