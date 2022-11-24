import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetRateLimiterInfo } from 'src/decorators/rate-limiter-info.decorator';
import {
  RateLimiterGuard,
  RateLimiterInfo,
} from 'src/guards/rate-limiter.guard';

@Controller()
@UseGuards(RateLimiterGuard)
export class PublicController {
  @Get('/info')
  async getRateLimiterInfo(@GetRateLimiterInfo() info: RateLimiterInfo) {
    return {
      controller: 'public',
      key: info.key,
      requestCount: info.requestCount,
    };
  }
}
