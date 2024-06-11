import 'reflect-metadata';

import { Field } from 'type-graphql';

export function Mapped<T extends { new (...args: any[]): {} }>(
  BaseClass: T,
  className: string
) {
  class ExtendedClass extends BaseClass {
    constructor(...args: any[]) {
      super(...args);
    }
  }

  const instance = new BaseClass();

  for (const propertyName of Object.getOwnPropertyNames(instance)) {
    const descriptor = Object.getOwnPropertyDescriptor(instance, propertyName);

    if (
      descriptor &&
      descriptor.writable &&
      typeof descriptor.value !== 'function'
    ) {
      let type: any;

      if (typeof descriptor.value === 'string') {
        type = String;
      } else if (typeof descriptor.value === 'number') {
        type = Number;
      } else if (typeof descriptor.value === 'boolean') {
        type = Boolean;
      }

      Field(() => type)(ExtendedClass.prototype, propertyName);
    }
  }

  return ExtendedClass;
}
