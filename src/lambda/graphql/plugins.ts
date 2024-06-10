export const LogPlugin = (sentryService: any) => {
  return {
    async requestDidStart(requestContext: any) {
      const args = [
        {
          query: requestContext.request.query,
          operation: requestContext.request.operationName,
          variables: requestContext.request.variables,
        },
      ];

      return {
        async willSendResponse(context: any) {
          console.log(`[GraphQlHandler.handle] Success:`, {
            result: JSON.stringify(context.response?.data, null, 1),
            calledWith: JSON.stringify(args, null, 1),
          });
        },
        async didEncounterErrors(context: any) {
          console.log(`[GraphQlHandler.handle] Error:`, {
            result: context.errors,
            calledWith: JSON.stringify(args, null, 1),
          });

          // await Promise.all((context.errors || []).map(sentryService.publish));

          // await sentryService.flush();
        },
      };
    },
  };
};
