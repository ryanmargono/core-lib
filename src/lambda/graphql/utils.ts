import { ArgsType, InputType, ObjectType } from 'type-graphql';
import { mutation, params, query, rawString, types } from 'typed-graphqlify';

import { Partial } from 'type-graphql-utils';
import { Mapped } from './mapper';
import { QueryArgs, type IQueryArgs } from './query';

export function getBaseGraphQlTypes<T extends { new (...args: any[]): {} }>(
  type: T,
  className: string
) {
  @ObjectType(`${className}Object`)
  @InputType(`${className}Input`)
  class Model extends Mapped(type, className) {}

  @InputType(`Partial${className}`)
  class PartialInput extends Partial(Model) {}

  @ArgsType()
  class Query extends QueryArgs(PartialInput) {}

  return {
    model: Model,
    partialInput: PartialInput,
    query: Query,
  };
}

export const getSchemaKeys = (object: any): { [key: string]: any } => {
  const result: { [key: string]: any } = {};

  Object.entries(object).forEach(([key, value]) => {
    let type;

    if (typeof value === 'string') {
      type = types.string;
    } else if (typeof value === 'number') {
      type = types.number;
    } else if (typeof value === 'boolean') {
      type = types.boolean;
    } else if (Array.isArray(value)) {
      type = [types.string];
    }

    result[key] = type;
  });

  return result;
};

export const createQueryRequest = <T>(opts: {
  name: string;
  args?: IQueryArgs<T> | T;
  keys: { [key: string]: any };
  omitKeys?: string[];
}) => {
  return opts.args
    ? query({
        [opts.name]: params({ ...serializeInput(opts.args) }, { ...opts.keys }),
      }).toString()
    : query({
        [opts.name]: { ...opts.keys },
      }).toString();
};

export const createMutationRequest = <T>(opts: {
  name: string;
  input?: Partial<T>;
  keys: { [key: string]: any };
  omitKeys?: string[];
}) =>
  opts.input
    ? mutation({
        [opts.name]: params({ input: serializeInput(opts.input) }, { ...opts.keys }),
      }).toString()
    : mutation({
        [opts.name]: { ...opts.keys },
      }).toString();

const serializeInput = (input: any): any => {
  if (typeof input === 'string') {
    return rawString(input);
  } else if (Array.isArray(input)) {
    return input.map((item: any) => serializeInput(item));
  } else if (typeof input === 'object' && input !== null) {
    const serializedObject: any = {};

    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        serializedObject[key] = serializeInput(input[key]);
      }
    }

    return serializedObject;
  }

  return input;
};
