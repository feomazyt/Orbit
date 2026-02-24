import { createSlice } from '@reduxjs/toolkit';
import type { CardEntity } from '@/shared/types';

type CardsState = {
  byList: Record<string, CardEntity[]>;
};

const initialState: CardsState = {
  byList: {},
};

export const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setCardsForList: (state, action: { payload: { listId: string; cards: CardEntity[] } }) => {
      state.byList[action.payload.listId] = action.payload.cards;
    },
  },
});

export const { setCardsForList } = cardsSlice.actions;
