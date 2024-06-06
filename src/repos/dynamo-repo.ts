import {
  DynamoStore,
  updateDynamoEasyConfig,
  type ModelConstructor,
} from '@shiftcoders/dynamo-easy';
import { IQueryArgs, QueryOpts } from '../graphql/query';

import { DynamoDB } from 'aws-sdk';
import { type IBuilder } from 'builder-pattern';
import { ulid } from 'ulidx';

export class DynamoRepo<
  T extends {
    id: string;
    objectType: string;
    createdAt: string;
    updatedAt: string;
  },
> {
  client: DynamoStore<T>;

  constructor(
    modelClazz: ModelConstructor<T>,
    public objectType: string,
    public gsiMappings: {
      [index: string]: { indexName: string; attribute: string };
    }
  ) {
    updateDynamoEasyConfig({
      tableNameResolver: () => process.env.DDB_TABLE_NAME!!,
    });

    this.client = new DynamoStore(modelClazz, new DynamoDB());
  }

  async getOne(opts: { id: string }): Promise<T | null> {
    return this.client.get(this.objectType, opts.id).exec();
  }

  async query(opts: IQueryArgs<T>): Promise<T[]> {
    const queryOpts = { ...new QueryOpts(), ...opts.options };

    const query = this.client.query().wherePartitionKey(this.objectType);

    if (queryOpts.gsi) {
      query.index(queryOpts.gsi);
    }

    Object.entries(opts.where || {}).forEach(([k, v]) => {
      const omit = queryOpts.gsi ? this.gsiMappings[queryOpts.gsi].attribute : 'id';

      if (k !== omit) {
        if (typeof v === 'string' && !v.length) {
          query.whereAttribute(k).lt(' ');
        } else {
          queryOpts.isSearch
            ? query.whereAttribute(k).beginsWith(v)
            : query.whereAttribute(k).eq(v);
        }
      } else {
        if (!queryOpts.skLowerBounds && !queryOpts.skUpperBounds) {
          query.whereSortKey().eq(v);
        }
      }
    });

    queryOpts.sortOrder === 'DESC' ? query.descending() : query.ascending();

    if (!!queryOpts.offsetKey) {
      query.exclusiveStartKey({ id: { S: queryOpts.offsetKey } });
    }

    if (!!queryOpts.skLowerBounds) {
      query.whereSortKey().gte(queryOpts.skLowerBounds);
    }

    if (!!queryOpts.skUpperBounds) {
      query.whereSortKey().lte(queryOpts.skUpperBounds);
    }

    const results = await query.execFetchAll();

    return queryOpts.limit ? results.slice(0, queryOpts.limit) : results;
  }

  async create(builder: IBuilder<T>): Promise<T> {
    const record = builder
      .objectType(this.objectType)
      .createdAt(new Date().toISOString())
      .updatedAt(new Date().toISOString())
      .id(ulid())
      .build();

    await this.client.put(record).exec();
    return record;
  }

  async update(opts: Partial<T>): Promise<T> {
    const { id, objectType, ...updated } = opts;
    updated.updatedAt = new Date().toISOString();

    const req = this.client.update(this.objectType, id);

    Object.entries(updated).forEach(([k, v]) => {
      if (k !== 'id') {
        req.updateAttribute(k as keyof T).set(v);
      }
    });

    await req.exec();

    return this.getOne({ id: opts.id!! }) as Promise<T>;
  }

  async delete(opts: { id: string }): Promise<boolean> {
    await this.client.delete(this.objectType, opts.id).exec();
    return true;
  }
}
