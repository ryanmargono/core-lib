import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BooleanSchemaType, StringSchemaType } from '../../graphql/types';

import type { IQueryArgs } from '../../graphql/query';

export const useBaseApiHooks = <T>(opts: { service: any; queryKey: string }) => {
  const queryClient = useQueryClient();

  return {
    getOne: (id?: string, queryOpts?: { disabled?: boolean }) => {
      return useQuery({
        queryKey: [opts.queryKey, id],
        queryFn: async (): Promise<T> => {
          return opts.service.getOne(id);
        },
        enabled: !queryOpts?.disabled,
      });
    },

    query: (
      queryArgs: IQueryArgs<T>,
      queryOpts?: { disabled?: boolean; queryKeyOverride?: any }
    ) => {
      return useQuery({
        queryKey: [
          opts.queryKey + 'S',
          ...(queryOpts?.queryKeyOverride ? [queryOpts?.queryKeyOverride] : []),
        ],
        queryFn: async (): Promise<T[]> => {
          return opts.service.query(queryArgs);
        },
        enabled: !queryOpts?.disabled,
      });
    },

    // queryChildrenOfParents: (
    //   queryArgs: IQueryArgs<T>,
    //   queryOpts: {
    //     disabled?: boolean;
    //     parentIdValues: string[] | undefined;
    //     parentIdKey: keyof T;
    //   }
    // ) => {
    //   return useQueries({
    //     queries: queryOpts.parentIdValues
    //       ? queryOpts.parentIdValues.map((id) => ({
    //           queryKey: [opts.queryKey, queryOpts.parentIdValues],
    //           queryFn: () =>
    //             opts.service.query({
    //               ...queryArgs,
    //               where: { ...queryArgs.where, [queryOpts.parentIdKey]: id },
    //             }),
    //         }))
    //       : [],
    //     combine: (results) => ({
    //       isLoading: results.some((r) => r.isLoading),
    //       isPending: results.some((r) => r.isPending),
    //       data: results.map((result) => result.data) as T[],
    //       isError: results.some((r) => r.isError),
    //     }),
    //   });
    // },

    createChildrenForParent: () => {
      return useMutation({
        mutationFn: async (mutOpts: {
          inputs: Partial<T>[];
          parentIdValue?: string;
        }): Promise<T[]> => {
          const res = await Promise.all<T>(mutOpts.inputs.map(opts.service.create));

          queryClient.setQueryData([opts.queryKey, mutOpts.parentIdValue], res);

          return res;
        },
      });
    },

    create: () => {
      return useMutation({
        mutationFn: async (input: Partial<T>): Promise<T> => {
          const res = await opts.service.create(input);

          const prevState = queryClient.getQueryData<T[]>([opts.queryKey + 'S']);

          queryClient.setQueryData<T[]>(
            [opts.queryKey + 'S'],
            prevState ? [res, ...prevState] : [res]
          );
          queryClient.setQueryData<T>([opts.queryKey, res.id], res);
          queryClient.setQueryData<T>([opts.queryKey], res);
          return res;
        },
      });
    },

    update: () => {
      return useMutation({
        mutationFn: async (input: Partial<T>): Promise<T> => {
          const res = await opts.service.update(input);

          const prevState = queryClient.getQueryData<T[]>([opts.queryKey + 'S']);

          queryClient.setQueryData<T[]>(
            [opts.queryKey + 'S'],
            (prevState || []).map((t: any) => (t.id === res.id ? res : t))
          );
          queryClient.setQueryData<T>([opts.queryKey, res.id], res);
          queryClient.setQueryData<T>([opts.queryKey], res);

          return res;
        },
      });
    },

    delete: () => {
      return useMutation({
        mutationFn: async (input: StringSchemaType): Promise<BooleanSchemaType> => {
          return opts.service.del(input);
        },
      });
    },
  };
};
