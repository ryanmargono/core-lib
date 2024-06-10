import Model, { put, type IFilterConditions } from 'dynamodels';
import { IQueryArgs, QueryOpts } from '../graphql/query';

import * as FilterOperations from 'dynamodels';

import { Builder } from 'builder-pattern';
import { ulid } from 'ulidx';

export class DynamoRepo<
  T extends Model<T> & {
    id: string;
    objectType: string;
    createdAt: string;
    updatedAt: string;
  }
> {
  entity: Model<T>;

  constructor(
    public opts: {
      tableName: string;
      defaultValues: T;
      gsiMappings?: {
        [index: string]: { indexName: string; attribute: string };
      };
    }
  ) {
    class Entity extends Model<T> {
      protected tableName = opts.tableName;
      protected pk = 'objectType';
      protected sk = 'id';
    }

    this.entity = new Entity();
  }

  async getOne(opts: { id: string }): Promise<T | null> {
    return this.entity.get(this.opts.defaultValues.objectType, opts.id);
  }

  async query(opts: IQueryArgs<T>): Promise<T[]> {
    const queryOpts = Builder(QueryOpts, opts.options).build();

    const query = this.entity.query();

    if (queryOpts.gsi) {
      query.index(queryOpts.gsi);
    }

    query.sort(queryOpts.sortOrder.toLowerCase() as 'asc' | 'desc');

    const filter = { ...opts.where };
    if (queryOpts.skFilterOperator && queryOpts.skFilterValue) {
      filter[this.opts.gsiMappings[opts.options.gsi].attribute] = FilterOperations[
        opts.options.skFilterOperator
      ](opts.options.skFilterValue);
    } else {
      query.filter(filter as IFilterConditions);
    }

    return query.execAll();
  }

  async create(opts: Partial<T>): Promise<T> {
    const record = Builder(this.opts.defaultValues, opts)
      .createdAt(new Date().toISOString())
      .updatedAt(new Date().toISOString())
      .id(ulid())
      .build();

    await this.entity.create(record);
    return record;
  }

  async update(opts: Partial<T>): Promise<T> {
    const { id, objectType, ...updatedAttributes } = opts;
    updatedAttributes.updatedAt = new Date().toISOString();

    const updated = {};
    for (let prop of Object.keys(updatedAttributes)) {
      updated[prop] = put(updatedAttributes[prop]);
    }

    await this.entity.update(this.opts.defaultValues.objectType, id, updated);

    return this.getOne({ id: opts.id!! }) as Promise<T>;
  }

  async delete(opts: { id: string }): Promise<boolean> {
    await this.entity.delete(this.opts.defaultValues.objectType, opts.id);
    return true;
  }
}
