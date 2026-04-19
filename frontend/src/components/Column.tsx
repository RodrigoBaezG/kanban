'use client';

import { useSortable, SortableContext } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column as ColumnType, CardItem } from '@/types/kanban';
import Card from './Card';
import { useState } from 'react';

interface Props {
  column: ColumnType;
  cards: CardItem[];
  deleteCard: (id: string | number) => void;
  updateColumnTitle: (id: string | number, title: string) => void;
  openAddCardModal: (columnId: string | number) => void;
}

export default function Column({ column, cards, deleteCard, updateColumnTitle, openAddCardModal }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(column.title);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="column-dragging" />;
  }

  const handleTitleSubmit = () => {
    setIsEditing(false);
    if (titleValue.trim()) {
      updateColumnTitle(column.id, titleValue);
    } else {
      setTitleValue(column.title);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="kanban-column">
      <div className="column-header" {...attributes} {...listeners}>
        {isEditing ? (
          <input
            autoFocus
            className="column-title-input"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
            }}
          />
        ) : (
          <h3 className="column-title" onClick={() => setIsEditing(true)}>
            {column.title}
          </h3>
        )}
      </div>

      <div className="column-body">
        <SortableContext items={cards.map((c) => c.id)}>
          {cards.map((card) => (
            <Card key={card.id} card={card} deleteCard={deleteCard} />
          ))}
        </SortableContext>
      </div>

      <button className="add-card-btn" onClick={() => openAddCardModal(column.id)}>
        + Add a Card
      </button>
    </div>
  );
}
