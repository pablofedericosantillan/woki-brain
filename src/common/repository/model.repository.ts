/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { IPaginatedParams, PaginatedWithTotal } from './types';
import { ConflictException } from '@nestjs/common';

export abstract class BaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  public async create(
    entity: Omit<T, '_id' | 'createdAt' | 'updatedAt'>,
    options?: QueryOptions<T>,
  ): Promise<T> {
    try {
      const insertedData = await this.model.create([entity], options);
      return insertedData[0];
    } catch (e) {
      if (e.code === 11000) throw new ConflictException('Item already exist.');
      throw e;
    }
  }

  public async getPaginated(
    paginated: IPaginatedParams,
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<T[]> {
    const { offset, limit } = paginated;

    return this.model
      .find(filter ?? {}, null, options)
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: 'asc' })
      .lean() as unknown as T[];
  }

  public async getPaginatedWithTotal(
    paginated: IPaginatedParams,
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<PaginatedWithTotal<T>> {
    const [docs, total] = await Promise.all([
      this.getPaginated(paginated, filter, options),
      this.model.countDocuments(filter ?? {}, options as any),
    ]);

    return { docs, total };
  }
}
