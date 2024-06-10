import { GraphQLClient } from 'graphql-request';
import { useQueryClient } from '@tanstack/react-query';

export const useApiClient = (endpoint: string) => {
  const graphQlClient = new GraphQLClient(endpoint);
  const queryClient = useQueryClient();

  const request = async <T>(queryString: string): Promise<T> => {
    const token = queryClient.getQueryData(['token']) || '';
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const res: any = await graphQlClient.request(queryString, {}, headers);
    return res[Object.keys(res)[0]] as T;
  };

  return { request };
};
