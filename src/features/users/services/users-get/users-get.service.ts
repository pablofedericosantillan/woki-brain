/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users.repository';
import { GetAllUsersRequest, GetAllUsersResponse } from '../../dtos';
import { UserDto } from '../../dtos/get-user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserGetService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAll(params: GetAllUsersRequest): Promise<GetAllUsersResponse> {
    const result = await this.usersRepository.getPaginated(params);

    const entries = result.map((r) => plainToInstance(UserDto, r));

    return {
      entries,
      limit: params.limit,
      offset: params.offset,
    };
  }
}
