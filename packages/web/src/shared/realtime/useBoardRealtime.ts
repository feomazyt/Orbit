import { useEffect } from 'react';
import type { CardEntity, CommentEntity } from '@/shared/types';
import { getSocket } from './socket';
import { api } from '@/shared/api';
import type { AnyAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store';
import { addToastGlobal } from '@/shared/ui/Toast';

/** Type-safe updateQueryData when endpoint names come from injectEndpoints (build-time fix). */
const updateQueryData = api.util.updateQueryData as unknown as <Result>(
  endpointName: string,
  arg: unknown,
  update: (draft: Result[]) => void
) => AnyAction;

type CardEventPayload = CardEntity & { actorId?: string };

type CardMovedPayload = CardEntity & { previousListId: string; actorId?: string };

type CardDeletedPayload = {
  id: string;
  listId: string;
  actorId?: string;
};

type CommentAddedPayload = CommentEntity & { actorId?: string };

export function useBoardRealtime(boardId: string | undefined | null) {
  const dispatch = useDispatch<AppDispatch>();
  const currentUserId = useSelector((s: RootState) => s.auth.user?.id ?? null);

  const isFromOtherUser = (actorId: string | undefined) =>
    actorId != null && currentUserId != null && actorId !== currentUserId;

  useEffect(() => {
    if (!boardId) return;

    const socket = getSocket();

    const joinBoard = () => {
      socket.emit('joinBoard', boardId);
    };

    socket.on('connect', joinBoard);
    if (socket.connected) {
      joinBoard();
    }

    const handleCardCreated = (payload: CardEventPayload) => {
      dispatch(
        updateQueryData<CardEntity>('getCards', payload.listId, (draft) => {
          const exists = draft.find((c) => c.id === payload.id);
          if (!exists) {
            draft.push(payload);
          }
        })
      );
      if (isFromOtherUser(payload.actorId)) {
        addToastGlobal('Tablica została zaktualizowana przez innego użytkownika.', 'info');
      }
    };

    const handleCardUpdated = (payload: CardEventPayload) => {
      dispatch(
        updateQueryData<CardEntity>('getCards', payload.listId, (draft) => {
          const idx = draft.findIndex((c) => c.id === payload.id);
          if (idx !== -1) {
            draft[idx] = payload;
          } else {
            draft.push(payload);
          }
        })
      );
      if (isFromOtherUser(payload.actorId)) {
        addToastGlobal('Tablica została zaktualizowana przez innego użytkownika.', 'info');
      }
    };

    const handleCardMoved = (payload: CardMovedPayload) => {
      const { previousListId, ...card } = payload;
      const targetListId = payload.listId;
      const position = Number(payload.position);

      // Remove card from source list
      dispatch(
        updateQueryData<CardEntity>('getCards', previousListId, (draft) => {
          const idx = draft.findIndex((c) => c.id === card.id);
          if (idx !== -1) {
            draft.splice(idx, 1);
          }
        })
      );

      // Add card to target list at position
      dispatch(
        updateQueryData<CardEntity>('getCards', targetListId, (draft) => {
          const existingIdx = draft.findIndex((c) => c.id === card.id);
          if (existingIdx !== -1) {
            draft[existingIdx] = card as CardEntity;
          } else {
            const insertAt = Math.min(position, draft.length);
            draft.splice(insertAt, 0, card as CardEntity);
          }
        })
      );

      if (isFromOtherUser(payload.actorId)) {
        addToastGlobal('Tablica została zaktualizowana przez innego użytkownika.', 'info');
      }
    };

    const handleCardDeleted = (payload: CardDeletedPayload) => {
      dispatch(
        updateQueryData<CardEntity>('getCards', payload.listId, (draft) => {
          const idx = draft.findIndex((c) => c.id === payload.id);
          if (idx !== -1) {
            draft.splice(idx, 1);
          }
        })
      );
      if (isFromOtherUser(payload.actorId)) {
        addToastGlobal('Tablica została zaktualizowana przez innego użytkownika.', 'info');
      }
    };

    const handleCommentAdded = (payload: CommentAddedPayload) => {
      const commentForCache: CommentEntity = {
        id: payload.id,
        cardId: payload.cardId,
        content: payload.content,
        user: payload.user,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
      };
      dispatch(
        updateQueryData<CommentEntity>('getComments', { cardId: payload.cardId }, (draft) => {
          if (!draft.find((c) => c.id === payload.id)) {
            draft.push(commentForCache);
          }
        })
      );
      if (isFromOtherUser(payload.actorId)) {
        addToastGlobal('Nowy komentarz w karcie.', 'info');
      }
    };

    socket.on('card:created', handleCardCreated);
    socket.on('card:updated', handleCardUpdated);
    socket.on('card:moved', handleCardMoved);
    socket.on('card:deleted', handleCardDeleted);
    socket.on('comment:added', handleCommentAdded);

    return () => {
      socket.off('connect', joinBoard);
      socket.emit('leaveBoard', boardId);
      socket.off('card:created', handleCardCreated);
      socket.off('card:updated', handleCardUpdated);
      socket.off('card:moved', handleCardMoved);
      socket.off('card:deleted', handleCardDeleted);
      socket.off('comment:added', handleCommentAdded);
    };
  }, [boardId, dispatch, currentUserId]);
}

