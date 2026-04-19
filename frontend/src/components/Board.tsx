'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column as ColumnType, CardItem, Id } from '@/types/kanban';
import Column from './Column';
import Card from './Card';

const initialColumns: ColumnType[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'testing', title: 'Testing' },
  { id: 'done', title: 'Done' },
];

const initialCards: CardItem[] = [
  { id: '1', columnId: 'todo', title: 'Database Migration', details: 'Migrate users to new schema.' },
  { id: '2', columnId: 'todo', title: 'Setup CI/CD', details: 'Configure GitHub Actions for deployment.' },
  { id: '3', columnId: 'in_progress', title: 'Kanban Board components', details: 'Create Board, Column, Card UI.' },
  { id: '4', columnId: 'done', title: 'Project Scaffolding', details: 'Initialize Next.js project and setup tests.' },
];

export default function Board() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [cards, setCards] = useState<CardItem[]>(initialCards);
  
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [activeCard, setActiveCard] = useState<CardItem | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<Id | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const deleteCard = (id: Id) => {
    setCards((cards) => cards.filter((card) => card.id !== id));
  };

  const updateColumnTitle = (id: Id, title: string) => {
    setColumns((columns) =>
      columns.map((col) => (col.id === id ? { ...col, title } : col))
    );
  };

  const openAddCardModal = (columnId: Id) => {
    setTargetColumnId(columnId);
    setIsModalOpen(true);
  };

  const addCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const details = formData.get('details') as string;

    if (!title.trim() || !targetColumnId) return;

    const newCard: CardItem = {
      id: Date.now().toString(),
      columnId: targetColumnId,
      title,
      details,
    };

    setCards([...cards, newCard]);
    setIsModalOpen(false);
    setTargetColumnId(null);
  };

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === 'Card') {
      setActiveCard(event.active.data.current.card);
      return;
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === 'Card';
    const isOverACard = over.data.current?.type === 'Card';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (!isActiveACard) return;

    if (isActiveACard && isOverACard) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((t) => t.id === activeId);
        const overIndex = cards.findIndex((t) => t.id === overId);

        if (cards[activeIndex].columnId !== cards[overIndex].columnId) {
          cards[activeIndex].columnId = cards[overIndex].columnId;
          return arrayMove(cards, activeIndex, overIndex - 1);
        }

        return arrayMove(cards, activeIndex, overIndex);
      });
    }

    if (isActiveACard && isOverAColumn) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((t) => t.id === activeId);
        cards[activeIndex].columnId = overId;
        return arrayMove(cards, activeIndex, activeIndex);
      });
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveCard(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === 'Column';
    if (isActiveAColumn) {
      setColumns((columns) => {
        const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
        const overColumnIndex = columns.findIndex((col) => col.id === overId);
        return arrayMove(columns, activeColumnIndex, overColumnIndex);
      });
    }
  }

  return (
    <>
      <div className="board-container">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="board">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <Column
                  key={col.id}
                  column={col}
                  cards={cards.filter((card) => card.columnId === col.id)}
                  deleteCard={deleteCard}
                  updateColumnTitle={updateColumnTitle}
                  openAddCardModal={openAddCardModal}
                />
              ))}
            </SortableContext>
          </div>
          <DragOverlay>
            {activeColumn && (
              <Column
                column={activeColumn}
                cards={cards.filter((card) => card.columnId === activeColumn.id)}
                deleteCard={deleteCard}
                updateColumnTitle={updateColumnTitle}
                openAddCardModal={openAddCardModal}
              />
            )}
            {activeCard && <Card card={activeCard} deleteCard={deleteCard} />}
          </DragOverlay>
        </DndContext>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <dialog open className="add-card-modal glass">
            <h2 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>Add New Card</h2>
            <form onSubmit={addCard}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input id="title" name="title" autoFocus required placeholder="Card title..." />
              </div>
              <div className="form-group">
                <label htmlFor="details">Details</label>
                <textarea id="details" name="details" rows={4} placeholder="Card details..."></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'var(--gray)' }}>Cancel</button>
                <button type="submit" className="primary">Add Card</button>
              </div>
            </form>
          </dialog>
        </div>
      )}
    </>
  );
}
