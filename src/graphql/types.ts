export class NumberSchemaType {
  value: number = -1;
}

export class StringSchemaType {
  value: string = '';
}

export class BooleanSchemaType {
  value: boolean = false;
}

export class KeyValueSchemaType {
  key: string = '';
  value: string = '';
}

export type Context<T> = {
  id: string;
  record: T;
};
