'use client';

import { useState, useMemo, useEffect } from 'react';
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

const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

interface Props {
  projectId: string;
  userName: string;
}

export default function Board({ projectId, userName }: Props) {
  const columnsKey = `kanban_cols_${userName}_${projectId}`;
  const cardsKey = `kanban_cards_${userName}_${projectId}`;

  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [activeCard, setActiveCard] = useState<CardItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<Id | null>(null);

  const columnsId = useMemo(() => columns.map(col => col.id), [columns]);

  useEffect(() => {
    const storedCols = localStorage.getItem(columnsKey);
    const storedCards = localStorage.getItem(cardsKey);

    if (storedCols) {
      setColumns(JSON.parse(storedCols));
    } else {
      const defaults = DEFAULT_COLUMNS.map((title, i) => ({
        id: `${projectId}_col_${i}`,
        title,
      }));
      setColumns(defaults);
    }

    setCards(storedCards ? JSON.parse(storedCards) : []);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(columnsKey, JSON.stringify(columns));
  }, [columns, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(cardsKey, JSON.stringify(cards));
  }, [cards, loaded]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const deleteCard = (id: Id) => setCards(prev => prev.filter(c => c.id !== id));

  const updateColumnTitle = (id: Id, title: string) =>
    setColumns(prev => prev.map(col => col.id === id ? { ...col, title } : col));

  const addColumn = () => {
    setColumns(prev => [...prev, { id: `col_${Date.now()}`, title: 'New Column' }]);
  };

  const deleteColumn = (id: Id) => {
    setColumns(prev => prev.filter(col => col.id !== id));
    setCards(prev => prev.filter(card => card.columnId !== id));
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
    setCards(prev => [...prev, {
      id: Date.now().toString(),
      columnId: targetColumnId,
      title,
      details,
    }]);
    setIsModalOpen(false);
    setTargetColumnId(null);
  };

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
    } else if (event.active.data.current?.type === 'Card') {
      setActiveCard(event.active.data.current.card);
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
      setCards(cards => {
        const activeIndex = cards.findIndex(t => t.id === activeId);
        const overIndex = cards.findIndex(t => t.id === overId);
        if (cards[activeIndex].columnId !== cards[overIndex].columnId) {
          cards[activeIndex].columnId = cards[overIndex].columnId;
          return arrayMove(cards, activeIndex, overIndex - 1);
        }
        return arrayMove(cards, activeIndex, overIndex);
      });
    }
    if (isActiveACard && isOverAColumn) {
      setCards(cards => {
        const activeIndex = cards.findIndex(t => t.id === activeId);
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
    if (active.data.current?.type === 'Column') {
      setColumns(cols => {
        const activeIndex = cols.findIndex(col => col.id === activeId);
        const overIndex = cols.findIndex(col => col.id === overId);
        return arrayMove(cols, activeIndex, overIndex);
      });
    }
  }

  if (!loaded) return null;

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
              {columns.map(col => (
                <Column
                  key={col.id}
                  column={col}
                  cards={cards.filter(card => card.columnId === col.id)}
                  deleteCard={deleteCard}
                  updateColumnTitle={updateColumnTitle}
                  openAddCardModal={openAddCardModal}
                  deleteColumn={deleteColumn}
                />
              ))}
            </SortableContext>
            <button className="add-column-btn" onClick={addColumn}>+ Add Column</button>
          </div>
          <DragOverlay>
            {activeColumn && (
              <Column
                column={activeColumn}
                cards={cards.filter(card => card.columnId === activeColumn.id)}
                deleteCard={deleteCard}
                updateColumnTitle={updateColumnTitle}
                openAddCardModal={openAddCardModal}
                deleteColumn={deleteColumn}
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
