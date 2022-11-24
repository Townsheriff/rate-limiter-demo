import { Injectable } from '@nestjs/common';
import {
  SampleReply,
  TimeSeriesAggregationType,
  TimeSeriesDuplicatePolicies,
} from '@redis/time-series/dist/commands';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

@Injectable()
export class RedisService {
  static async createService(url: string) {
    const client = createClient({
      url,
    });

    await client.connect();

    return new RedisService(client);
  }

  private client: RedisClient;

  constructor(client: RedisClient) {
    this.client = client;
  }

  async addToTimeSeries(options: {
    key: string;
    value: number;
    timestamp: string | number;
    retention: number;
  }) {
    const { key, value, timestamp, retention } = options;

    await this.client.ts.add(key, timestamp, value, {
      RETENTION: retention,
      // if we hit requests on the same millisecond then we do 1 + 1
      ON_DUPLICATE: TimeSeriesDuplicatePolicies.SUM,
    });
  }

  async getTimeSeriesRange(options: {
    key: string;
    start: string;
    end: string;
    count: number;
  }): Promise<SampleReply[]> {
    const { key, start, end, count } = options;

    return this.client.ts.range(key, start, end, {
      COUNT: count,
    });
  }

  async getTimeSeriesRangeSum(options: {
    key: string;
    start: string | number;
    end: string | number;
    count: number;
    bucketSize: number;
  }): Promise<SampleReply[]> {
    const { key, start, end, count, bucketSize } = options;

    return this.client.ts.range(key, start, end, {
      COUNT: count,
      AGGREGATION: {
        type: TimeSeriesAggregationType.SUM,
        EMPTY: true,
        timeBucket: bucketSize,
      },
    });
  }
}
