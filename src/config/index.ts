import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CorsConfig } from './cors/cors.config';

export enum NodeEnv {
  Development = 'develop',
}

export class EnvConfig {
  appName = 'Proyect test';

  @IsEnum(NodeEnv)
  env: NodeEnv = (process.env.NODE_ENV as NodeEnv) ?? NodeEnv.Development;

  @Type(() => Number)
  @IsInt()
  port = process.env.PORT || 8000;

  @Type()
  @ValidateNested()
  cors: CorsConfig = new CorsConfig();

  @IsNotEmpty()
  @IsString()
  MONGO_URI: string = process.env.MONGO_URI;
}
