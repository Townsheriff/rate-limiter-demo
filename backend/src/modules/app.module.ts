import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { PrivateModule } from './private.module';
import { PublicModule } from './public.module';

@Module({
  imports: [
    PublicModule,
    PrivateModule,
    RouterModule.register([
      {
        path: 'private',
        module: PrivateModule,
      },
      {
        path: 'public',
        module: PublicModule,
      },
    ]),
  ],
})
export class AppModule {}
