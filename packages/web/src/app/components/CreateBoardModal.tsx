import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBoardMutation } from '@/shared/api';
import { Button, Input, Modal, useToast } from '@/shared/ui';

type CreateBoardModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateBoardModal({ open, onClose }: CreateBoardModalProps) {
  const [createBoard] = useCreateBoardMutation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Podaj nazwę tablicy.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const board = await createBoard({ title: trimmed }).unwrap();
      addToast('Tablica została utworzona.', 'success');
      onClose();
      setTitle('');
      navigate(`/boards/${board.id}`);
    } catch {
      addToast('Nie udało się utworzyć tablicy.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setTitle('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nowa tablica"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Nazwa"
          placeholder="np. Marketing Q4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error}
          autoFocus
          disabled={submitting}
        />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="m"
            onClick={handleClose}
            disabled={submitting}
          >
            Anuluj
          </Button>
          <Button type="submit" variant="primary" size="m" disabled={submitting}>
            Zapisz
          </Button>
        </div>
      </form>
    </Modal>
  );
}
