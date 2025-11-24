import { ArrayUnique, IsArray, IsString, NotContains } from 'class-validator';

export class CorsConfig {
  @IsString()
  origin: string | boolean = process.env.CORS_ORIGIN || '*';

  @IsArray()
  @ArrayUnique()
  @NotContains(' ', { each: true })
  methods: string[] = (
    process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE'
  )
    .split(',')
    .map((value) => value.trim());
}
