/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import { HealthModule } from './controllers/health/health.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './controllers/users/users.module';
import { AppConfigModule, AppConfigService } from './common/app-config';
import { createMongooseOptions } from './config/mongo/mongoose-config';

@Module({
  imports: [
    AppConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: async (config: AppConfigService) => {
        return createMongooseOptions(config.getConfig().MONGO_URI);
      },
      inject: [AppConfigService],
    }),
    // Controllers
    HealthModule,
    UserModule,
  ],
  providers: [],
})
export class AppModule {}
