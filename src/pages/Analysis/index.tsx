import React, { useState, useEffect } from 'react';
import { Empty, Spin, Row, Col, Card, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTradingStore } from '../../stores/tradingStore';
import type { Position } from '../../types';
import './styles.css';

// 위젯 컴포넌트들
import { SetupAnalysisWidget } from './widgets/SetupAnalysisWidget';
import { TimeAnalysisWidget } from './widgets/TimeAnalysisWidget';
import { PeriodAnalysisWidget } from './widgets/PeriodAnalysisWidget';
import { FilterWidget } from './widgets/FilterWidget';
import { MonteCarloWidget } from './widgets/MonteCarloWidget';

export const AnalysisPage: React.FC = () => {
  const { t } = useTranslation('analysis');
  const { positions, isLoading: positionsLoading, activeAccount } = useTradingStore();
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [filters, setFilters] = useState({
    dateRange: null as [Date, Date] | null,
    setupTypes: [] as string[],
    rating: null as number | null,
    status: 'all' as 'all' | 'active' | 'closed',
  });

  // 포지션 필터링
  useEffect(() => {
    let filtered = [...positions];

    // 상태 필터
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status.toUpperCase());
    }

    // 셋업 타입 필터
    if (filters.setupTypes.length > 0) {
      filtered = filtered.filter(p => p.setupType && filters.setupTypes.includes(p.setupType));
    }

    // 레이팅 필터
    if (filters.rating) {
      filtered = filtered.filter(p => p.rating === filters.rating);
    }

    // 날짜 범위 필터 - brokerDate 기준
    if (filters.dateRange) {
      const [start, end] = filters.dateRange;
      const startStr = start.toISOString().split('T')[0]; // YYYY-MM-DD
      const endStr = end.toISOString().split('T')[0]; // YYYY-MM-DD
      
      filtered = filtered.filter(p => {
        // 첫 BUY 거래의 brokerDate 사용
        const firstBuyTrade = p.trades?.find(t => t.tradeType === 'BUY');
        if (!firstBuyTrade?.brokerDate) return false;
        
        // brokerDate 형식 통일 (YYYY/MM/DD -> YYYY-MM-DD)
        const brokerDate = firstBuyTrade.brokerDate.replace(/\//g, '-');
        
        // 날짜 문자열 직접 비교
        return brokerDate >= startStr && brokerDate <= endStr;
      });
    }

    setFilteredPositions(filtered);
  }, [positions, filters]);

  // 메트릭은 이미 tradingStore에서 로드 시 계산되므로 중복 계산 제거

  if (!activeAccount) {
    return (
      <div className="analysis-empty-state">
        <Empty description={t('selectAccount')} />
      </div>
    );
  }

  if (positionsLoading) {
    return (
      <Spin spinning={true} size="large" tip={t('loadingData')}>
        <div className="analysis-loading" style={{ minHeight: '400px' }} />
      </Spin>
    );
  }

  const tabItems = [
    {
      key: 'overview',
      label: t('tabs.overview'),
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title={t('filter.title')} className="analysis-filter-card">
              <FilterWidget
                filters={filters}
                onFiltersChange={setFilters}
                positions={positions}
              />
            </Card>
          </Col>
          
          <Col xs={24} md={24} lg={12} xl={12}>
            <Card title={t('widgets.setupAnalysis')} className="analysis-card">
              <SetupAnalysisWidget positions={filteredPositions} activeAccount={activeAccount} />
            </Card>
          </Col>
          
          <Col xs={24} md={24} lg={12} xl={12}>
            <Card title={t('widgets.timeAnalysis')} className="analysis-card">
              <TimeAnalysisWidget positions={filteredPositions} activeAccount={activeAccount} />
            </Card>
          </Col>
          
          <Col span={24}>
            <Card title={t('widgets.periodAnalysis')} className="analysis-card">
              <PeriodAnalysisWidget positions={filteredPositions} activeAccount={activeAccount} />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'monteCarlo',
      label: t('tabs.monteCarlo'),
      children: <MonteCarloWidget />
    }
  ];

  return (
    <div className="analysis-page">
      <Tabs defaultActiveKey="overview" size="large" items={tabItems} />
    </div>
  );
};

export default AnalysisPage;