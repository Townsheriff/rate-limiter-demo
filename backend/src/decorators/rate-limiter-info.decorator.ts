import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetRateLimiterInfo = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (request.rateLimiter) {
      return request.rateLimiter;
    }

    return null;
  },
);
