import { Module } from '@nestjs/common';
import { CommonModule } from './common.module';
import { RateLimiterService } from '../services/rate-limiter.service';
import { PublicController as PublicController } from '../controllers/public.controller';
import { ConfigService } from '@nestjs/config';
import { RateLimiterGuard } from 'src/guards/rate-limiter.guard';

@Module({
  controllers: [PublicController],
  providers: [
    RateLimiterService,
    {
      provide: 'RATE_LIMITER_MAX_REQ',
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow('RATE_LIMITER_NOT_AUTH_MAX_REQ');
      },
      inject: [ConfigService],
    },
    {
      provide: 'RATE_LIMITER_WINDOW_SIZE',
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow('RATE_LIMITER_NOT_AUTH_WINDOW_SIZE');
      },
      inject: [ConfigService],
    },
    {
      provide: 'RATE_LIMITER_STRATEGY',
      useFactory: () => {
        return 'IP_ADDRESS';
      },
      inject: [ConfigService],
    },
    RateLimiterGuard,
  ],
  imports: [CommonModule],
})
export class PublicModule {}
