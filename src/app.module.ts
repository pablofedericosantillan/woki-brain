import { Module } from '@nestjs/common';
import { HealthModule } from './controllers/health/health.module';

@Module({
  imports: [HealthModule],
  providers: [],
})
export class AppModule {}
