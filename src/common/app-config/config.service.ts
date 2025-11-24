/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config';

@Injectable()
export class AppConfigService extends NestConfigService<EnvConfig> {
  getConfig(): EnvConfig {
    return (this as any).internalConfig._PROCESS_ENV_VALIDATED as EnvConfig;
  }
}
