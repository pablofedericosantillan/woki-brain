import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQuery {
  /**
   * The number of items per page.
   * @example 10
   */
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  /**
   * Determines the number of items to skip.
   * @example 0
   */
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset: number = 0;

  /**
   * Whether to return the total number of items.
   * @example false
   */
  @IsOptional()
  @IsBoolean()
  count?: boolean = false;
}
