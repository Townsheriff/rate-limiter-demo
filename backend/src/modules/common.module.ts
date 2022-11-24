import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from '../services/redis.service';
import * as v from '@badrap/valita';

const envConfig = v.object({
  RATE_LIMITER_AUTH_MAX_REQ: v.number(),
  RATE_LIMITER_AUTH_WINDOW_SIZE: v.number(),
  RATE_LIMITER_NOT_AUTH_MAX_REQ: v.number(),
  RATE_LIMITER_NOT_AUTH_WINDOW_SIZE: v.number(),
  REDIS_URL: v.string(),
});

export type EnvConfig = v.ValitaResult<typeof envConfig>;

@Global()
@Module({
  providers: [
    {
      provide: RedisService,
      useFactory: (config: ConfigService) => {
        const redisUrl = config.getOrThrow<string>('REDIS_URL');
        return RedisService.createService(redisUrl);
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (config: Record<string, string>) => {
        return envConfig.parse({
          RATE_LIMITER_AUTH_MAX_REQ: Number(config.RATE_LIMITER_AUTH_MAX_REQ),
          RATE_LIMITER_AUTH_WINDOW_SIZE: Number(
            config.RATE_LIMITER_AUTH_WINDOW_SIZE,
          ),
          RATE_LIMITER_NOT_AUTH_MAX_REQ: Number(
            config.RATE_LIMITER_NOT_AUTH_MAX_REQ,
          ),
          RATE_LIMITER_NOT_AUTH_WINDOW_SIZE: Number(
            config.RATE_LIMITER_NOT_AUTH_WINDOW_SIZE,
          ),
          REDIS_URL: config.REDIS_URL,
        });
      },
    }),
  ],
})
export class CommonModule {}
