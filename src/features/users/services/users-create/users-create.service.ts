/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users.repository';

@Injectable()
export class UserCreateService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(params: any): Promise<{ id: string }> {
    const result = await this.usersRepository.create(params);

    return { id: result._id };
  }
}
