import { Module, MiddlewareConsumer } from '@nestjs/common';
import { CommonModule } from './common.module';
import { RateLimiterService } from '../services/rate-limiter.service';
import { AuthenticationMiddleware } from 'src/middlewares/authentication-middleware.service';
import { PrivateController } from 'src/controllers/private.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RateLimiterGuard } from 'src/guards/rate-limiter.guard';

@Module({
  controllers: [PrivateController],
  providers: [
    RateLimiterService,
    AuthenticationMiddleware,
    {
      provide: 'RATE_LIMITER_MAX_REQ',
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow('RATE_LIMITER_AUTH_MAX_REQ');
      },
      inject: [ConfigService],
    },
    {
      provide: 'RATE_LIMITER_WINDOW_SIZE',
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow('RATE_LIMITER_AUTH_WINDOW_SIZE');
      },
      inject: [ConfigService],
    },
    {
      provide: 'RATE_LIMITER_STRATEGY',
      useFactory: () => {
        return 'USERNAME';
      },
      inject: [ConfigService],
    },
    RateLimiterGuard,
  ],
  imports: [CommonModule, ConfigModule],
})
export class PrivateModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(PrivateController);
  }
}
