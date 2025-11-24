import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationResult<T> {
  @ApiProperty()
  entries: T[];

  /**
   * The number of items per page.
   * @example 5
   */
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  /**
   * The number of items skipped.
   * @example 0
   */
  @IsInt()
  @Min(0)
  offset: number = 0;

  /**
   * The total number of items.
   *
   * Only returned if `count` is set to true.
   * @example 42
   */
  @IsInt()
  @IsOptional()
  totalCount?: number;
}
