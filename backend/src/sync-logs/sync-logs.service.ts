import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SyncLog, SyncLogDocument } from './schemas/sync-log.schema';

@Injectable()
export class SyncLogsService {
  constructor(
    @InjectModel(SyncLog.name)
    private readonly syncLogModel: Model<SyncLogDocument>,
  ) {}

  async createLog(taskName: string, triggeredBy = 'cron'): Promise<SyncLogDocument> {
    const log = new this.syncLogModel({
      taskName,
      status: 'running',
      startTime: new Date(),
      triggeredBy,
    });
    return log.save();
  }

  async updateLogSuccess(
    id: string,
    results: any,
    errors: any[] = [],
  ): Promise<SyncLogDocument | null> {
    const log = await this.syncLogModel.findById(id).exec();
    if (!log) return null;

    const endTime = new Date();
    const durationMs = endTime.getTime() - log.startTime.getTime();

    log.status = 'completed';
    log.endTime = endTime;
    log.durationMs = durationMs;
    log.results = results;
    log.syncErrors = errors;

    return log.save();
  }

  async updateLogFailure(
    id: string,
    error: Error | string,
    errors: any[] = [],
  ): Promise<SyncLogDocument | null> {
    const log = await this.syncLogModel.findById(id).exec();
    if (!log) return null;

    const endTime = new Date();
    const durationMs = endTime.getTime() - log.startTime.getTime();

    log.status = 'failed';
    log.endTime = endTime;
    log.durationMs = durationMs;
    log.error = typeof error === 'string' ? error : error.message;
    log.syncErrors = errors;

    return log.save();
  }

  async getLogs(taskName: string, limit = 50): Promise<SyncLogDocument[]> {
    return this.syncLogModel
      .find({ taskName })
      .sort({ startTime: -1 })
      .limit(limit)
      .exec();
  }

  async getLogById(id: string): Promise<SyncLogDocument | null> {
    return this.syncLogModel.findById(id).exec();
  }
}
