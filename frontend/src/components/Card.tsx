'use client';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { CardItem } from '@/types/kanban';

interface Props {
  card: CardItem;
  deleteCard: (id: string | number) => void;
}

export default function Card({ card, deleteCard }: Props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="card-dragging"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card group"
      {...attributes}
      {...listeners}
    >
      <div className="card-header">
        <h4 className="card-title">{card.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteCard(card.id);
          }}
          className="delete-card-btn"
          title="Delete Card"
        >
          ×
        </button>
      </div>
      <p className="card-details">{card.details}</p>
    </div>
  );
}
