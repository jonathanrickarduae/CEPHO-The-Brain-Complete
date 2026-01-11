import { useState, useCallback, useRef } from 'react';
import { haptics } from '@/lib/haptics';

interface DragItem<T> {
  id: string;
  data: T;
  index: number;
}

interface UseDragAndDropOptions<T> {
  items: T[];
  getItemId: (item: T) => string;
  onReorder: (items: T[]) => void;
  onDragStart?: (item: T, index: number) => void;
  onDragEnd?: (item: T, fromIndex: number, toIndex: number) => void;
}

interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  overIndex: number | null;
}

export function useDragAndDrop<T>({
  items,
  getItemId,
  onReorder,
  onDragStart,
  onDragEnd,
}: UseDragAndDropOptions<T>) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    overIndex: null,
  });

  const draggedItemRef = useRef<DragItem<T> | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, item: T, index: number) => {
      haptics.impact();
      
      draggedItemRef.current = {
        id: getItemId(item),
        data: item,
        index,
      };

      setDragState({
        isDragging: true,
        draggedIndex: index,
        overIndex: null,
      });

      // Set drag data
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', getItemId(item));

      // Create custom drag image
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.opacity = '0.8';
      dragImage.style.transform = 'scale(1.05)';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);

      onDragStart?.(item, index);
    },
    [getItemId, onDragStart]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (dragState.overIndex !== index) {
        haptics.selection();
        setDragState((prev) => ({
          ...prev,
          overIndex: index,
        }));
      }
    },
    [dragState.overIndex]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (dragState.draggedIndex !== index) {
        setDragState((prev) => ({
          ...prev,
          overIndex: index,
        }));
      }
    },
    [dragState.draggedIndex]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      const draggedItem = draggedItemRef.current;
      if (!draggedItem || draggedItem.index === dropIndex) {
        setDragState({
          isDragging: false,
          draggedIndex: null,
          overIndex: null,
        });
        return;
      }

      haptics.success();

      // Reorder items
      const newItems = [...items];
      const [removed] = newItems.splice(draggedItem.index, 1);
      newItems.splice(dropIndex, 0, removed);

      onReorder(newItems);
      onDragEnd?.(draggedItem.data, draggedItem.index, dropIndex);

      setDragState({
        isDragging: false,
        draggedIndex: null,
        overIndex: null,
      });
      draggedItemRef.current = null;
    },
    [items, onReorder, onDragEnd]
  );

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedIndex: null,
      overIndex: null,
    });
    draggedItemRef.current = null;
  }, []);

  // Get drag props for an item
  const getDragProps = useCallback(
    (item: T, index: number) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, item, index),
      onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
      onDragEnter: (e: React.DragEvent) => handleDragEnter(e, index),
      onDragLeave: handleDragLeave,
      onDrop: (e: React.DragEvent) => handleDrop(e, index),
      onDragEnd: handleDragEnd,
      'data-dragging': dragState.draggedIndex === index,
      'data-drag-over': dragState.overIndex === index && dragState.draggedIndex !== index,
    }),
    [
      handleDragStart,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
      dragState.draggedIndex,
      dragState.overIndex,
    ]
  );

  return {
    dragState,
    getDragProps,
    isDragging: dragState.isDragging,
    draggedIndex: dragState.draggedIndex,
    overIndex: dragState.overIndex,
  };
}

// Touch-based drag and drop for mobile
interface UseTouchDragOptions<T> extends UseDragAndDropOptions<T> {
  longPressDelay?: number;
}

export function useTouchDrag<T>({
  items,
  getItemId,
  onReorder,
  onDragStart,
  onDragEnd,
  longPressDelay = 300,
}: UseTouchDragOptions<T>) {
  const [touchState, setTouchState] = useState({
    isDragging: false,
    draggedIndex: null as number | null,
    currentY: 0,
    startY: 0,
  });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerItem = useCallback(
    (item: T, element: HTMLElement | null) => {
      const id = getItemId(item);
      if (element) {
        itemRefs.current.set(id, element);
      } else {
        itemRefs.current.delete(id);
      }
    },
    [getItemId]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, item: T, index: number) => {
      const touch = e.touches[0];
      const startY = touch.clientY;

      longPressTimer.current = setTimeout(() => {
        haptics.impact();
        setTouchState({
          isDragging: true,
          draggedIndex: index,
          currentY: startY,
          startY,
        });
        onDragStart?.(item, index);
      }, longPressDelay);
    },
    [longPressDelay, onDragStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (!touchState.isDragging) return;

      const touch = e.touches[0];
      setTouchState((prev) => ({
        ...prev,
        currentY: touch.clientY,
      }));
    },
    [touchState.isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!touchState.isDragging || touchState.draggedIndex === null) {
      setTouchState({
        isDragging: false,
        draggedIndex: null,
        currentY: 0,
        startY: 0,
      });
      return;
    }

    // Calculate drop position based on Y coordinate
    const itemElements = Array.from(itemRefs.current.values());
    let dropIndex = touchState.draggedIndex;

    for (let i = 0; i < itemElements.length; i++) {
      const rect = itemElements[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      if (touchState.currentY < midY) {
        dropIndex = i;
        break;
      }
      dropIndex = i + 1;
    }

    if (dropIndex !== touchState.draggedIndex) {
      haptics.success();
      const newItems = [...items];
      const [removed] = newItems.splice(touchState.draggedIndex, 1);
      newItems.splice(dropIndex > touchState.draggedIndex ? dropIndex - 1 : dropIndex, 0, removed);
      onReorder(newItems);
      onDragEnd?.(items[touchState.draggedIndex], touchState.draggedIndex, dropIndex);
    }

    setTouchState({
      isDragging: false,
      draggedIndex: null,
      currentY: 0,
      startY: 0,
    });
  }, [touchState, items, onReorder, onDragEnd]);

  const getTouchDragProps = useCallback(
    (item: T, index: number) => ({
      ref: (el: HTMLElement | null) => registerItem(item, el),
      onTouchStart: (e: React.TouchEvent) => handleTouchStart(e, item, index),
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      style: touchState.isDragging && touchState.draggedIndex === index
        ? {
            transform: `translateY(${touchState.currentY - touchState.startY}px)`,
            zIndex: 1000,
            opacity: 0.9,
          }
        : undefined,
    }),
    [registerItem, handleTouchStart, handleTouchMove, handleTouchEnd, touchState]
  );

  return {
    touchState,
    getTouchDragProps,
    isDragging: touchState.isDragging,
  };
}
