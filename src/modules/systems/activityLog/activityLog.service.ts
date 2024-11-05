import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from 'src/base/base.interface';
import { ActivityLog } from '../../../database/schemas/activityLog.schema';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLog>,
  ) {}

  async logActivity(
    action: string,
    documentId: string,
    collectionName: string,
    user?: IUser,
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
