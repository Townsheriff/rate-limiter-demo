import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RateLimiterService {
  constructor(private redisService: RedisService) {}

  async addToRequestCount(key: string, ttl: number): Promise<void> {
    await this.redisService.addToTimeSeries({
      key: key,
      value: 1,
      retention: ttl,
      timestamp: Date.now(),
    });
  }

  async getLatestSum(key: string, ttl: number): Promise<number> {
    try {
      const now = Date.now();

      const response = await this.redisService.getTimeSeriesRangeSum({
        key: key,
        bucketSize: ttl,
        count: 0,
        start: now - ttl,
        end: now,
      });

      return response.reduce((acc, curr) => acc + curr.value, 0);
    } catch (err) {
      return 0;
    }
  }

  async getOldestDate(key: string): Promise<number> {
    const [oldestSample] = await this.redisService.getTimeSeriesRange({
      key: key,
      start: '-',
      end: '+',
      count: 1,
    });

    return oldestSample.timestamp;
  }
}
