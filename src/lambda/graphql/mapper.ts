import 'reflect-metadata';

import { ArgsType, Field, InputType, ObjectType } from 'type-graphql';

import { Model } from '@shiftcoders/dynamo-easy';

export function Mapped<T extends { new (...args: any[]): {} }>(BaseClass: T) {
  @ObjectType()
  @InputType()
  @Model()
  @ArgsType()
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
