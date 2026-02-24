import { Provider } from 'react-redux';
import { ToastProvider } from '@/shared/ui';
import { AppRouter } from '@/app/router';
import { store } from '@/app/store';

export function AppProvider() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </Provider>
  );
}
