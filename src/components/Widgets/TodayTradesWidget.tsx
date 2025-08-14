import React, { useMemo, useState, useRef } from 'react';
import { Tag, Empty, theme, Popover, Radio, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ExpandedState
} from '@tanstack/react-table';
import { useTradingStore } from '../../stores/tradingStore';
import { useMetricsStore } from '../../stores/metricsStore';
import type { PositionMetrics } from '../../stores/metricsStore';
import type { Trade, Position } from '../../types';
import dayjs from 'dayjs';
import { TradeTypeTag } from '../Common/TradeTypeTag';

// 확장된 거래 타입 (사이즈와 리스크 정보 포함)
interface ExtendedTrade extends Trade {
  individualSize: number;
  cumulativeSize: number;
  openRisk?: number;
  netRisk?: number;
}

// 포지션과 메트릭을 합친 타입
interface PositionWithMetrics extends Position, Partial<PositionMetrics> {
  todayTrades: ExtendedTrade[];
  key: string;
  isNewPosition: boolean;
  rMultiple?: number;
}

interface TodayTradesWidgetProps {
  selectedDate: dayjs.Dayjs;
  compact?: boolean; // 간략 모드
}

import './TodayTradesWidget.css';

export const TodayTradesWidget: React.FC<TodayTradesWidgetProps> = ({ selectedDate }) => {
  const { t } = useTranslation('widgets');
  const { token } = theme.useToken();
  const { trades, positions } = useTradingStore();
  const { totalAssets } = useMetricsStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [groupByPosition] = useState(true); // 포지션 그룹화 토글
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [riskType, setRiskType] = useState<'open' | 'net'>('net'); // 리스크 타입 설정
  const [displayUnit, setDisplayUnit] = useState<'percent' | 'dollar'>('percent'); // 표시 단위 설정
  const [tableAlign, setTableAlign] = useState<'left' | 'center' | 'right'>('center'); // 테이블 정렬 설정
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 선택된 날짜의 거래 필터링 (영웅문 날짜 기준)
  const selectedDateTrades = useMemo(() => {
    if (!trades) return [];
    
    const selectedDateStr = selectedDate.format('YYYY-MM-DD');
    const selectedDateSlash = selectedDate.format('YYYY/MM/DD'); // 슬래시 형식도 지원
    
    const filtered = trades.filter(trade => {
      // brokerDate가 있으면 사용, 없으면 tradeDate 사용 (fallback)
      if (trade.brokerDate) {
        // 두 형식 모두 체크 (YYYY-MM-DD 또는 YYYY/MM/DD)
        const match = trade.brokerDate === selectedDateStr || trade.brokerDate === selectedDateSlash;
        return match;
      }
      // brokerDate가 없는 경우 false 반환 (brokerDate 필수)
      return false;
    });
    
    // 시간순 정렬 (실제 시간 기준, 영웅문 시간 고려)
    return filtered.sort((a, b) => {
      // brokerTime이 있으면 영웅문 시간 기준 정렬
      const getTimeValue = (trade: Trade) => {
        // brokerTime 우선 사용
        const timeStr = trade.brokerTime || trade.tradeTime;
        if (!timeStr) return 0;
        const [hour, minute] = timeStr.split(':').map(Number);
        // 00시~05시는 24를 더해서 계산 (미국 장 마감 시간 고려)
        const adjustedHour = hour < 6 ? hour + 24 : hour;
        return adjustedHour * 60 + minute;
      };
      
      // 실제 시간으로 정렬 (순서 보장)
      const dateA = new Date(a.tradeDate).getTime();
      const dateB = new Date(b.tradeDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      
      // 같은 실제 날짜면 brokerTime/tradeTime으로 정렬
      return getTimeValue(a) - getTimeValue(b);
    });
  }, [trades, selectedDate]);

  // 포지션별로 그룹화된 데이터
  const positionGroupedData = useMemo(() => {
    if (!positions || !selectedDateTrades.length) return [];
    
    // 오늘 관련된 포지션들 필터링 (영웅문 날짜 기준)
    const selectedDateStr = selectedDate.format('YYYY-MM-DD');
    const selectedDateSlash = selectedDate.format('YYYY/MM/DD'); // 슬래시 형식도 지원
    const relevantPositions = positions.filter(position => {
      // 1. 오늘 오픈된 포지션 (첫 BUY의 brokerDate 확인)
      if (position.trades && position.trades.length > 0) {
        const firstBuy = position.trades.find(t => t.tradeType === 'BUY');
        if (firstBuy?.brokerDate === selectedDateStr || firstBuy?.brokerDate === selectedDateSlash) return true;
      }
      
      // 2. 오늘 거래가 있는 포지션 (brokerDate 확인)
      if (position.trades) {
        return position.trades.some(trade => {
          // brokerDate로만 확인
          return trade.brokerDate === selectedDateStr || trade.brokerDate === selectedDateSlash;
        });
      }
      
      return false;
    });
    
    // 각 포지션에 메트릭 계산 및 당일 거래 추가
    const getPositionMetrics = useMetricsStore.getState().getPositionMetrics;
    return relevantPositions.map(position => {
      const metrics = getPositionMetrics(position.id) || {};
      
      // 해당 포지션의 당일 거래들 with 사이즈 및 리스크 계산
      let cumulativeSize = 0;
      const todayTradesWithSize = position.trades?.filter(trade => {
        // brokerDate로만 확인
        return trade.brokerDate === selectedDateStr || trade.brokerDate === selectedDateSlash;
      }).map(trade => {
        // 개별 거래 사이즈 계산
        const tradeValue = trade.price.mul(trade.quantity);
        const individualSize = totalAssets && totalAssets > 0 
          ? tradeValue.div(totalAssets).mul(100).toNumber() 
          : 0;
        
        // 누적 사이즈 계산 (BUY는 더하고, SELL은 뺌)
        if (trade.tradeType === 'BUY') {
          cumulativeSize += individualSize;
        } else {
          cumulativeSize -= individualSize;
        }
        
        // 개별 거래의 리스크 계산 (포지션 전체 리스크를 거래 비율로 분배)
        let tradeOpenRisk: number | undefined;
        let tradeNetRisk: number | undefined;
        
        if (trade.tradeType === 'BUY' && position.totalShares > 0) {
          const tradeRatio = trade.quantity / position.totalShares;
          
          if (metrics.pureRisk !== undefined) {
            tradeOpenRisk = metrics.pureRisk * tradeRatio;
          }
          
          if (metrics.totalRisk !== undefined) {
            tradeNetRisk = metrics.totalRisk * tradeRatio;
          }
        }
        
        return {
          ...trade,
          individualSize,
          cumulativeSize: Math.abs(cumulativeSize), // 누적 사이즈는 절대값으로
          openRisk: tradeOpenRisk,
          netRisk: tradeNetRisk
        };
      }) || [];
      
      // 첫 BUY의 brokerDate로 isNewPosition 판단
      const firstBuyTrade = position.trades?.find(t => t.tradeType === 'BUY');
      const isNewPosition = firstBuyTrade?.brokerDate === selectedDateStr || 
                            firstBuyTrade?.brokerDate === selectedDateSlash;
      
      return {
        ...position,
        ...metrics,
        todayTrades: todayTradesWithSize,
        key: position.id,
        isNewPosition
      };
    });
  }, [positions, selectedDateTrades, selectedDate]);

  // TanStack Table용 포지션 컬럼 정의
  const positionColumns: ColumnDef<PositionWithMetrics>[] = useMemo(() => [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <span
            className={`expand-icon ${row.getIsExpanded() ? 'expanded' : ''}`}
            onClick={row.getToggleExpandedHandler()}
            style={{ cursor: 'pointer', fontSize: '10px' }}
          >
            ▶
          </span>
        ) : null;
      },
      size: 40,
    },
    {
      accessorKey: 'ticker',
      header: '티커',
      size: 80,
    },
    {
      accessorKey: 'status', 
      header: '상태',
      size: 80,
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>
            {status === 'ACTIVE' ? '보유중' : '청산'}
          </Tag>
        );
      },
    },
    {
      accessorKey: 'size',
      header: 'Size',
      size: 80,
      cell: ({ getValue }) => {
        const value = getValue() as number | undefined;
        return value ? `${value.toFixed(2)}%` : '-';
      },
    },
    {
      accessorKey: riskType === 'open' ? 'pureRisk' : 'totalRisk',
      header: riskType === 'open' ? 'Open Risk' : 'Net Risk',
      size: 100,
      cell: ({ row }) => {
        const value = row.getValue(riskType === 'open' ? 'pureRisk' : 'totalRisk') as number | undefined;
        if (value === undefined) return '-';
        
        if (displayUnit === 'percent') {
          return (
            <span style={{ color: value > 0 ? token.colorError : token.colorSuccess }}>
              {value.toFixed(2)}%
            </span>
          );
        } else {
          // 달러로 변환: 리스크% × 총자산
          const dollarValue = totalAssets ? (value / 100) * totalAssets : 0;
          return (
            <span style={{ color: value > 0 ? token.colorError : token.colorSuccess }}>
              ${dollarValue.toFixed(0)}
            </span>
          );
        }
      },
    },
    {
      accessorKey: 'realizedPnl',
      header: 'P&L',
      size: 100,
      cell: ({ row }) => {
        const position = row.original;
        // 포지션의 실현 P&L 계산 (청산된 경우만)
        if (position.status === 'CLOSED' && position.realizedPnl) {
          const pnlValue = position.realizedPnl.toNumber();
          
          if (displayUnit === 'percent') {
            const pnlPercent = totalAssets && totalAssets > 0 
              ? (pnlValue / totalAssets * 100) 
              : 0;
            return (
              <span style={{ color: pnlValue > 0 ? token.colorSuccess : token.colorError }}>
                {pnlPercent.toFixed(2)}%
              </span>
            );
          } else {
            return (
              <span style={{ color: pnlValue > 0 ? token.colorSuccess : token.colorError }}>
                ${pnlValue.toFixed(0)}
              </span>
            );
          }
        }
        return '-';
      },
    },
    {
      id: 'tradeCount',
      header: '거래 수',
      size: 80,
      cell: ({ row }) => (
        <Tag>{t('todayTrades.tradesCount', { count: row.original.todayTrades?.length || 0 })}</Tag>
      ),
    },
  ], [riskType, displayUnit, token, totalAssets, t]);


  // TanStack Table 인스턴스 생성
  const table = useReactTable({
    data: positionGroupedData,
    columns: positionColumns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original.todayTrades?.length > 0,
  });

  // 확장된 행 렌더링 함수
  const renderExpandedRow = (record: PositionWithMetrics) => {
    if (!record.todayTrades || record.todayTrades.length === 0) return null;

    return (
      <table className={`today-trades-table sub-table align-${tableAlign}`}>
        <thead>
          <tr>
            <th style={{ width: 80 }}>{t('todayTrades.timeColumn')}</th>
            <th style={{ width: 80 }}>{t('todayTrades.tradeColumn')}</th>
            <th style={{ width: 80 }}>Size</th>
            <th style={{ width: 100 }}>{riskType === 'open' ? 'Open Risk' : 'Net Risk'}</th>
            <th style={{ width: 100 }}>P&L</th>
            <th style={{ width: 80 }}>R-Multiple</th>
          </tr>
        </thead>
        <tbody>
          {record.todayTrades.map((trade: ExtendedTrade) => (
            <tr key={trade.id}>
              <td>
                {trade.tradeTime ? (
                  (() => {
                    const timeParts = trade.tradeTime.split(':');
                    if (timeParts.length >= 2) {
                      return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
                    }
                    return '-';
                  })()
                ) : '-'}
              </td>
              <td>
                <TradeTypeTag type={trade.tradeType} />
              </td>
              <td>
                {trade.individualSize ? `${trade.individualSize.toFixed(2)}%` : '-'}
              </td>
              <td>
                {(() => {
                  const riskValue = riskType === 'open' ? trade.openRisk : trade.netRisk;
                  if (riskValue === undefined) return '-';
                  
                  if (displayUnit === 'percent') {
                    return (
                      <span style={{ color: riskValue > 0 ? token.colorError : token.colorSuccess }}>
                        {riskValue.toFixed(2)}%
                      </span>
                    );
                  } else {
                    const dollarValue = totalAssets ? (riskValue / 100) * totalAssets : 0;
                    return (
                      <span style={{ color: riskValue > 0 ? token.colorError : token.colorSuccess }}>
                        ${dollarValue.toFixed(0)}
                      </span>
                    );
                  }
                })()}
              </td>
              <td>
                {(() => {
                  if (trade.tradeType === 'SELL' && record.avgBuyPrice) {
                    const pnl = trade.price.minus(record.avgBuyPrice).times(trade.quantity);
                    
                    if (displayUnit === 'percent') {
                      const pnlPercent = totalAssets && totalAssets > 0 
                        ? pnl.toNumber() / totalAssets * 100
                        : 0;
                      return (
                        <span style={{ color: pnl.greaterThan(0) ? token.colorSuccess : token.colorError }}>
                          {pnlPercent.toFixed(2)}%
                        </span>
                      );
                    } else {
                      return (
                        <span style={{ color: pnl.greaterThan(0) ? token.colorSuccess : token.colorError }}>
                          ${pnl.toNumber().toFixed(0)}
                        </span>
                      );
                    }
                  }
                  return '-';
                })()}
              </td>
              <td>
                {trade.tradeType === 'SELL' && record.rMultiple !== undefined ? (
                  <span style={{ 
                    color: record.rMultiple > 0 ? token.colorSuccess : token.colorError,
                    fontWeight: 'bold'
                  }}>
                    {record.rMultiple.toFixed(2)}R
                  </span>
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (selectedDateTrades.length === 0 && positionGroupedData.length === 0) {
    return (
      <div ref={containerRef} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description={t('todayTrades.noTrades', { date: selectedDate.format('MM/DD') })} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="today-trades-table-container">
      <div className="widget-header" style={{ padding: '16px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>오늘의 거래</h4>
        <Popover
          content={
            <Space direction="vertical" size="middle">
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>리스크 타입</div>
                <Radio.Group value={riskType} onChange={(e) => setRiskType(e.target.value)}>
                  <Space direction="vertical">
                    <Radio value="net">Net Risk (실현손익 포함)</Radio>
                    <Radio value="open">Open Risk (손절가 기준)</Radio>
                  </Space>
                </Radio.Group>
              </div>
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>표시 단위</div>
                <Radio.Group value={displayUnit} onChange={(e) => setDisplayUnit(e.target.value)}>
                  <Space direction="vertical">
                    <Radio value="percent">% (총자산 대비)</Radio>
                    <Radio value="dollar">$ (달러)</Radio>
                  </Space>
                </Radio.Group>
              </div>
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>테이블 정렬</div>
                <Radio.Group value={tableAlign} onChange={(e) => setTableAlign(e.target.value)}>
                  <Space>
                    <Radio value="left">왼쪽</Radio>
                    <Radio value="center">가운데</Radio>
                    <Radio value="right">오른쪽</Radio>
                  </Space>
                </Radio.Group>
              </div>
            </Space>
          }
          title="설정"
          trigger="click"
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          placement="bottomRight"
        >
          <SettingOutlined 
            style={{ 
              fontSize: '16px', 
              cursor: 'pointer',
              color: token.colorTextSecondary
            }} 
          />
        </Popover>
      </div>
      <div className="today-trades-table-wrapper">
        {groupByPosition ? (
          <table className={`today-trades-table align-${tableAlign}`}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <React.Fragment key={row.id}>
                  <tr className={row.getCanExpand() ? 'expandable' : ''}>
                    {row.getVisibleCells().map(cell => (
                      <td 
                        key={cell.id}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {row.getIsExpanded() && (
                    <tr className="expanded-row">
                      <td colSpan={row.getVisibleCells().length}>
                        <div className="expanded-content">
                          {renderExpandedRow(row.original)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          // TODO: 개별 거래 테이블 구현
          <div>{t('todayTrades.individualViewNotReady')}</div>
        )}
      </div>
    </div>
  );
};