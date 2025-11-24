import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { UsersRepository } from './users.repository';
import { UserCreateService, UserGetService } from './services';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersRepository, UserCreateService, UserGetService],
  exports: [UserCreateService, UserGetService],
})
export class UsersModuleBase {}
