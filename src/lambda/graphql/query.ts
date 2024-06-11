import { ArgsType, Field, InputType, type ClassType } from 'type-graphql';

@InputType()
export class QueryOpts {
  @Field({ nullable: true }) paginateOffsetKey?: string;
  @Field({ defaultValue: 0 }) limit?: number = 0;
  // @Field({ defaultValue: false }) isSearch?: boolean = false;

  @Field({ defaultValue: 'DESC' }) sortOrder?: string = 'DESC';

  @Field({ nullable: true }) gsi?: string;

  @Field({ nullable: true }) skFilterOperator?: string;
  @Field({ nullable: true }) skFilterValue?: string;
}

export class IQueryArgs<T> {
  where?: Partial<T>;
  options?: QueryOpts;
}

export function QueryArgs<T extends object>(tClass: ClassType<T>) {
  @ArgsType()
  abstract class QueryArgsClass {
    @Field(() => tClass, { defaultValue: null })
    where?: T;

    @Field(() => QueryOpts, { defaultValue: () => new QueryOpts() })
    options?: QueryOpts;
  }
  return QueryArgsClass as any;
}
