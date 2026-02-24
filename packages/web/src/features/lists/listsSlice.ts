import { createSlice } from '@reduxjs/toolkit';
import type { ListEntity } from '@/shared/types';

type ListsState = {
  byBoard: Record<string, ListEntity[]>;
};

const initialState: ListsState = {
  byBoard: {},
};

export const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    setListsForBoard: (state, action: { payload: { boardId: string; lists: ListEntity[] } }) => {
      state.byBoard[action.payload.boardId] = action.payload.lists;
    },
  },
});

export const { setListsForBoard } = listsSlice.actions;
