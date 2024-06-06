import { ArgsType, InputType, ObjectType } from 'type-graphql';
import {
  BooleanSchemaType,
  KeyValueSchemaType,
  NumberSchemaType,
  StringSchemaType,
} from './types';

import { Mapped } from './mapper';

@InputType('NumberInput')
@ObjectType('NumberObjectType')
@ArgsType()
export class NumberType extends Mapped(NumberSchemaType) {}

@InputType('StringInput')
@ObjectType('StringObjectType')
@ArgsType()
export class StringType extends Mapped(StringSchemaType) {}

@InputType('BooleanInput')
@ObjectType('BooleanObjectType')
@ArgsType()
export class BooleanType extends Mapped(BooleanSchemaType) {}

@InputType('KeyValueInput')
@ObjectType('KeyValueObjectType')
@ArgsType()
export class KeyValueType extends Mapped(KeyValueSchemaType) {}
