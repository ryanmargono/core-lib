import type { MiddlewareInterface, NextFn, ResolverData } from 'type-graphql';

import type { Context } from './types';
import { DynamoRepo } from '../repos/dynamo-repo';

export const Guard = <
  T extends {
    id: string;
    objectType: string;
    createdAt: string;
    updatedAt: string;
  },
>(opts: {
  service: DynamoRepo<T>;
}) => {
  return class MyMiddleware implements MiddlewareInterface<Context<T>> {
    service: DynamoRepo<any>;

    constructor() {
      this.service = opts.service;
    }

    use = async ({ context }: ResolverData<Context<T>>, next: NextFn) => {
      if (!context.id) {
        throw 'Unauthorized';
      }

      const record = await this.service.getOne({ id: context.id });
      if (!record) {
        throw 'Unauthorized';
      }

      context.record = record;
      return next();
    };
  };
};