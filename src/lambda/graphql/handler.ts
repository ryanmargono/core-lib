import {
  handlers,
  startServerAndCreateLambdaHandler,
} from '@as-integrations/aws-lambda';
import { buildSchemaSync, type NonEmptyArray } from 'type-graphql';

import { ApolloServer } from '@apollo/server';
import { JwtUtil } from '../utils/jwt-util';
import { WithReporting } from '../utils/reporting-util';
import { LogPlugin } from './plugins';

@WithReporting()
export class GraphqlHandler {
  server: ApolloServer;

  constructor(
    public opts: { resolvers: NonEmptyArray<Function>; sentryService: any }
  ) {
    const schema = buildSchemaSync({
      nullableByDefault: true,
      validate: { forbidUnknownValues: false },
      resolvers: this.opts.resolvers,
    });

    this.server = new ApolloServer({
      schema,
      introspection: true,
      plugins: [LogPlugin(this.opts.sentryService)],
    });
  }

  initHandler = () =>
    startServerAndCreateLambdaHandler(
      this.server,
      handlers.createAPIGatewayProxyEventV2RequestHandler(),
      {
        context: async (lambdaCtx) => {
          const headerToken = lambdaCtx?.event?.headers?.authorization || '';
          const token = headerToken?.split(' ')[1] || '';
          return JwtUtil.decode({ token });
        },
      }
    );
}
