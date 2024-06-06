import { BooleanSchemaType, StringSchemaType } from '../../graphql/types';
import {
  createMutationRequest,
  createQueryRequest,
  getSchemaKeys,
} from '../../graphql/utils';

import type { IQueryArgs } from '../../graphql/query';
import { useApiClient } from './api-client';

export const useBaseApiService = <T>(opts: {
  endpoint: string;
  objectType: string;
  objectInstance: any;
}) => {
  const client = useApiClient(opts.endpoint);

  const query = (args: IQueryArgs<T>) => {
    const query = createQueryRequest({
      name: `get${opts.objectType}s`,
      args,
      keys: getSchemaKeys(opts.objectInstance),
    });

    return client.request<T[]>(query);
  };

  const getOne = (id: string) => {
    const query = createQueryRequest<StringSchemaType>({
      name: `get${opts.objectType}`,
      args: { value: id },
      keys: getSchemaKeys(opts.objectInstance),
    });

    return client.request<T>(query);
  };

  const create = (input: Partial<T>) => {
    const inputWithDefaults = { ...opts.objectInstance };
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        inputWithDefaults[key] = value;
      }
    });

    const mut = createMutationRequest<T>({
      name: `create${opts.objectType}`,
      input: inputWithDefaults,
      keys: getSchemaKeys(opts.objectInstance),
    });

    return client.request<T>(mut);
  };

  const update = (input: Partial<T>) => {
    const inputWithDefaults: any = { ...input };
    Object.entries(input).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        inputWithDefaults[key] = opts.objectInstance[key];
      }
    });

    const mut = createMutationRequest<T>({
      name: `update${opts.objectType}`,
      input: inputWithDefaults,
      keys: getSchemaKeys(opts.objectInstance),
    });

    return client.request<T>(mut);
  };

  const del = (input: StringSchemaType) => {
    const mut = createMutationRequest<StringSchemaType>({
      name: `delete${opts.objectType}`,
      input,
      keys: getSchemaKeys(new StringSchemaType()),
    });

    return client.request<BooleanSchemaType>(mut);
  };

  return { query, getOne, create, update, del };
};
