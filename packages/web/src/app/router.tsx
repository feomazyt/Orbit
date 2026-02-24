import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { GuestOnlyRoute } from '@/app/components/GuestOnlyRoute';
import { HomeOrRedirect } from '@/app/components/HomeOrRedirect';

const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { Layout } = await import('@/app/layout');
      return { Component: Layout };
    },
    children: [
      {
        index: true,
        Component: HomeOrRedirect,
      },
      {
        path: 'login',
        Component: GuestOnlyRoute,
        children: [
          {
            index: true,
            lazy: async () => {
              const { LoginPage } = await import('@/app/pages/LoginPage');
              return { Component: LoginPage };
            },
          },
        ],
      },
      {
        path: 'register',
        Component: GuestOnlyRoute,
        children: [
          {
            index: true,
            lazy: async () => {
              const { RegisterPage } = await import('@/app/pages/RegisterPage');
              return { Component: RegisterPage };
            },
          },
        ],
      },
      {
        path: 'boards',
        Component: ProtectedRoute,
        children: [
          {
            index: true,
            lazy: async () => {
              const { BoardsPage } = await import('@/app/pages/BoardsPage');
              return { Component: BoardsPage };
            },
          },
          {
            path: ':boardId',
            lazy: async () => {
              const { BoardDetailPage } = await import('@/app/pages/BoardDetailPage');
              return { Component: BoardDetailPage };
            },
          },
        ],
      },
      {
        path: 'ui',
        lazy: async () => {
          const { UIPage } = await import('@/app/pages/UIPage');
          return { Component: UIPage };
        },
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
