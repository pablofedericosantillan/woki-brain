import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Dtos, UserCreateService, UserGetService } from 'src/features/users';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userCreateService: UserCreateService,
    private readonly userGetService: UserGetService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create new users',
  })
  async create(
    @Body() payload: Dtos.CreateUserRequest,
  ): Promise<{ id: string }> {
    return this.userCreateService.create(payload);
  }

  @Get()
  @ApiOperation({
    summary: 'Get users',
  })
  async getAll(
    @Query() dto: Dtos.GetAllUsersRequest,
  ): Promise<Dtos.GetAllUsersResponse> {
    return this.userGetService.getAll(dto);
  }
}
