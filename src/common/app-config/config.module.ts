import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AppConfigService } from './config.service';
import { EnvConfig } from 'src/config';

@Global()
@Module({})
export class AppConfigModule {
  static forRoot(): DynamicModule {
    const validateEnv = (config: Record<string, unknown>) => {
      const validated = plainToInstance(EnvConfig, config, {
        enableImplicitConversion: true,
      });

      const errors = validateSync(validated, {
        skipMissingProperties: false,
      });

      if (errors.length) {
        throw new Error(
          'Invalid environment configuration:\n' +
            errors.map((e) => JSON.stringify(e.constraints)).join('\n'),
        );
      }

      return validated;
    };

    return {
      module: AppConfigModule,
      global: true,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
          validate: validateEnv,
          cache: true,
        }),
      ],
      providers: [AppConfigService],
      exports: [AppConfigService],
    };
  }
}
