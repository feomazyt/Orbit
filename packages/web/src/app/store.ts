import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '@/features/auth';
import { boardsSlice } from '@/features/boards';
import { listsSlice } from '@/features/lists';
import { cardsSlice } from '@/features/cards';
import { commentsSlice } from '@/features/comments';
import { api } from '@/shared/api/api';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    boards: boardsSlice.reducer,
    lists: listsSlice.reducer,
    cards: cardsSlice.reducer,
    comments: commentsSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
