import { useState } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import type { ModalLayout } from '../types';
import { findItemPosition } from '../utils/layoutHelpers';

/**
 * 드래그 앤 드롭 로직 관리 훅
 */
export const useDragAndDrop = (
  _layout: ModalLayout,
  setLayout: React.Dispatch<React.SetStateAction<ModalLayout>>
) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동 후 드래그 시작 - 의도치 않은 드래그 방지
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // 드래그 종료 - 카테고리 간 이동 지원
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;

    setLayout((prevLayout) => {
      const newCategories = [...prevLayout.categories];
      
      // 드래그된 아이템 위치 찾기
      const sourcePosition = findItemPosition(active.id as string, newCategories);
      if (!sourcePosition) return prevLayout;

      // 타겟 위치 찾기
      const targetPosition = findItemPosition(over.id as string, newCategories);
      if (!targetPosition) return prevLayout;

      const { categoryIndex: sourceCategoryIndex, itemIndex: sourceItemIndex, item: draggedItem } = sourcePosition;
      const { categoryIndex: targetCategoryIndex, itemIndex: targetItemIndex } = targetPosition;

      // 같은 카테고리 내 이동
      if (sourceCategoryIndex === targetCategoryIndex) {
        newCategories[sourceCategoryIndex].items = arrayMove(
          newCategories[sourceCategoryIndex].items,
          sourceItemIndex,
          targetItemIndex
        );
      } else {
        // 다른 카테고리로 이동
        // 소스에서 제거
        newCategories[sourceCategoryIndex].items.splice(sourceItemIndex, 1);
        // 타겟에 추가
        newCategories[targetCategoryIndex].items.splice(targetItemIndex, 0, draggedItem);
      }

      return { ...prevLayout, categories: newCategories };
    });
  };

  return {
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd
  };
};