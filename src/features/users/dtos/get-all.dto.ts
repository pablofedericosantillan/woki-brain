import { IsOptional, IsString } from 'class-validator';
import { PaginationResult } from 'src/common/dto/pagination.dto';
import { PaginationQuery } from 'src/common/dto/pagination-query.dto';
import { UserDto } from './get-user.dto';

export class GetAllUsersRequest extends PaginationQuery {
  /**
   * The individual email
   * @example "email@email.com"
   */
  @IsString()
  @IsOptional()
  email?: string;
}

export class GetAllUsersResponse extends PaginationResult<UserDto> {}
