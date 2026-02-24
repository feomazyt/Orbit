import { createSlice } from '@reduxjs/toolkit';
import type { CommentEntity } from '@/shared/types';

type CommentsState = {
  byCard: Record<string, CommentEntity[]>;
};

const initialState: CommentsState = {
  byCard: {},
};

export const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setCommentsForCard: (state, action: { payload: { cardId: string; comments: CommentEntity[] } }) => {
      state.byCard[action.payload.cardId] = action.payload.comments;
    },
  },
});

export const { setCommentsForCard } = commentsSlice.actions;
