import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

export const ProtectedRoute = (props: { queryKey: string }) => {
  const location = useLocation();
  const queryClient = useQueryClient();

  if (!queryClient.getQueryData([props.queryKey])) {
    return <Navigate to='/sign-in' state={{ from: location }} replace />;
  }

  return <Outlet />;
};
