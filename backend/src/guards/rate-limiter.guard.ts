import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthRequest } from 'src/middlewares/authentication-middleware.service';
import { RateLimiterService } from 'src/services/rate-limiter.service';

export type RateLimiterInfo = {
  key: string;
  requestCount: number;
};

@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(
    private readonly rateLimiter: RateLimiterService,
    @Inject('RATE_LIMITER_MAX_REQ')
    private readonly maxRequestCount: number,
    @Inject('RATE_LIMITER_WINDOW_SIZE')
    private readonly windowSize: number,
    @Inject('RATE_LIMITER_STRATEGY')
    private readonly strategy: 'IP_ADDRESS' | 'USERNAME',
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    // retrieve key name for fifo queue
    const rlKey =
      this.strategy === 'IP_ADDRESS'
        ? this.getIpAddress(req)
        : this.getUsername(req);

    // retrieves all not expired request count sum from buckets
    // at most we will have 2 buckets: add items to newest bucket and remove items from oldest bucket
    // items from oldest bucket are automatically removed when we lookup bucket size
    const requestCount = await this.rateLimiter.getLatestSum(
      rlKey,
      this.windowSize,
    );

    req.rateLimiter = {
      key: rlKey,
      requestCount: requestCount,
    };

    if (requestCount < this.maxRequestCount) {
      await this.rateLimiter.addToRequestCount(rlKey, this.windowSize);
      return true;
    }

    const oldestDate = await this.rateLimiter.getOldestDate(rlKey);

    res.statusCode = 429;
    res.send({
      serviceAvailable: new Date(oldestDate + this.windowSize),
    });

    return false;
  }

  getIpAddress(req: Request): string {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    return Array.isArray(ip) ? ip[0] : ip;
  }

  getUsername(req: AuthRequest): string {
    if (!req.auth) {
      throw new Error('Authentication middleware is required');
    }

    return req.auth.username;
  }
}
