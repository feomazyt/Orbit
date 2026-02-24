import { createSlice } from '@reduxjs/toolkit';
import type { BoardEntity } from '@/shared/types';

type BoardsState = {
  list: BoardEntity[];
};

const initialState: BoardsState = {
  list: [],
};

export const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards: (state, action: { payload: BoardEntity[] }) => {
      state.list = action.payload;
    },
  },
});

export const { setBoards } = boardsSlice.actions;
