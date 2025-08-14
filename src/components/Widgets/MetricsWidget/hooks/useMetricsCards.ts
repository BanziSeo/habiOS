import { useState, useEffect, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import type { MetricCard, MetricGroup } from '../types';
import { getDefaultCards, STORAGE_KEYS } from '../constants';

export const useMetricsCards = (groups: MetricGroup[]) => {
  const [cards, setCards] = useState<MetricCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const savedCards = localStorage.getItem(STORAGE_KEYS.CARDS);
    const defaultCards = getDefaultCards();
    if (savedCards) {
      const parsedCards = JSON.parse(savedCards) as MetricCard[];
      // 새로운 카드가 DEFAULT_CARDS에 추가된 경우를 처리
      const savedCardIds = new Set(parsedCards.map(c => c.id));
      const newCards = defaultCards.filter(c => !savedCardIds.has(c.id));
      
      // 기존 카드와 새로운 카드를 병합
      setCards([...parsedCards, ...newCards]);
    } else {
      setCards(defaultCards);
    }
    setIsLoaded(true);
  }, []);

  // 데이터 저장
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    }
  }, [cards, isLoaded]);

  // 그룹 삭제 시 카드 이동
  const moveCardsToFirstGroup = useCallback((deletedGroupId: string) => {
    const firstGroupId = groups.find(g => g.id !== deletedGroupId)?.id;
    if (firstGroupId) {
      setCards(cards.map(card => 
        card.groupId === deletedGroupId ? { ...card, groupId: firstGroupId } : card
      ));
    }
  }, [groups, cards]);

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeCard = cards.find(c => c.id === active.id);
    const overCard = cards.find(c => c.id === over.id);

    if (activeCard && overCard) {
      // 다른 그룹으로 이동
      if (activeCard.groupId !== overCard.groupId) {
        setCards(cards.map(card => 
          card.id === activeCard.id 
            ? { ...card, groupId: overCard.groupId }
            : card
        ));
      } else {
        // 같은 그룹 내에서 순서 변경
        const oldIndex = cards.findIndex(c => c.id === active.id);
        const newIndex = cards.findIndex(c => c.id === over.id);

        if (oldIndex !== newIndex) {
          setCards(arrayMove(cards, oldIndex, newIndex));
        }
      }
    }
  }, [cards]);

  return {
    cards,
    isLoaded,
    moveCardsToFirstGroup,
    handleDragEnd,
  };
};