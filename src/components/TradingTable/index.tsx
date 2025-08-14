import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Typography, App, Select, Rate } from 'antd';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table';
import { EditOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Decimal } from 'decimal.js';
import type { Position } from '../../types';
import { useMetricsStore } from '../../stores/metricsStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { notifyError } from '../../utils/errorNotification';
import ModalManager from '../Modals/ModalManager';
import { useTradingStore } from '../../stores/tradingStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useResponsive } from '../../hooks/useResponsive';
import { InitialREditCell } from './InitialREditCell';
import { StopLossEditPopover } from './StopLossEditPopover';
import { PositionMemoModal } from '../Modals/PositionMemoModal';

const { Text } = Typography;

interface TradingTableProps {
  positions: Position[];
}

// 컬럼 설정 타입
interface ColumnConfig {
  key: string;
  title: string;
  visible: boolean;
  order: number;
}

// 기본 컬럼 설정
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'ticker', title: 'Ticker', visible: true, order: 0 },
  { key: 'setup', title: 'Setup', visible: true, order: 1 },
  { key: 'rating', title: 'Rating', visible: true, order: 2 },
  { key: 'size', title: 'Size', visible: true, order: 3 },
  { key: 'maxSize', title: 'Max Size', visible: true, order: 4 },
  { key: 'avgPrice', title: 'Avg. Price', visible: true, order: 5 },
  { key: 'stopLoss', title: 'Stop Loss', visible: true, order: 6 },
  { key: 'realizedPnl', title: 'Realized P&L', visible: true, order: 7 },
  { key: 'aumPnl', title: 'AUM PnL%', visible: true, order: 8 },
  { key: 'initialR', title: 'Initial R', visible: true, order: 9 },
  { key: 'rMultiple', title: 'R-Multiple', visible: true, order: 10 },
  { key: 'pureRisk', title: 'Open Risk %', visible: true, order: 11 },
  { key: 'totalRisk', title: 'Net Risk %', visible: true, order: 12 },
  { key: 'memo', title: 'Memo', visible: true, order: 13 },
];

const TradingTable: React.FC<TradingTableProps> = ({ positions }) => {
  const { t } = useTranslation(['common', 'widgets', 'messages']);
  const { message } = App.useApp();
  const responsive = useResponsive();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [memoModalVisible, setMemoModalVisible] = useState(false);
  const [memoModalPosition, setMemoModalPosition] = useState<Position | null>(null);
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const activeAccount = useTradingStore(state => state.activeAccount);
  const { generalSettings } = useSettingsStore();
  const { updatePosition } = useTradingStore();

  // localStorage에서 컬럼 설정 불러오기
  useEffect(() => {
    const loadSettings = () => {
      const savedColumns = localStorage.getItem('tradingTableColumns');
      if (savedColumns) {
        try {
          setColumnConfigs(JSON.parse(savedColumns));
        } catch (e) {
          notifyError(t('tableSettings.loadError'), t('tableSettings.loadErrorMessage'));
        }
      }
    };
    
    loadSettings();
    
    window.addEventListener('tradingTableSettingsChanged', loadSettings);
    
    return () => {
      window.removeEventListener('tradingTableSettingsChanged', loadSettings);
    };
  }, []);

  // 총자산 가져오기
  useEffect(() => {
    const fetchTotalAssets = async () => {
      if (activeAccount) {
        try {
          const latestEquity = await window.electronAPI.equityCurve.getLatest(activeAccount.id);
          if (latestEquity) {
            const totalValue = new Decimal(latestEquity.total_value);
            // metricsStore를 통해 총자산 업데이트
            const { updateTotalAssets } = useMetricsStore.getState();
            updateTotalAssets(totalValue.toNumber());
          }
        } catch (error) {
          notifyError('총자산 조회 실패', error);
        }
      }
    };
    
    fetchTotalAssets();
  }, [activeAccount]);

  // metricsStore에서 메트릭 가져오기
  const getPositionMetrics = useMetricsStore(state => state.getPositionMetrics);
  // 메트릭 스토어의 lastUpdated를 구독하여 변경 감지
  const metricsLastUpdated = useMetricsStore(state => state.lastUpdated);
  
  // 메트릭 계산된 포지션 데이터
  const positionsWithMetrics = useMemo(() => {
    return positions.map(position => {
      const metrics = getPositionMetrics(position.id) || {};
      return {
        ...position,
        ...metrics
      };
    });
  }, [positions, getPositionMetrics, metricsLastUpdated]);

  // 액션 버튼 핸들러
  const handleAction = (position: Position) => {
    setSelectedPosition(position);
    setModalVisible(true);
  };
  
  // Initial R 저장 핸들러
  const handleSaveInitialR = useCallback(async (positionId: string, value: number) => {
    if (value < 0) {
      message.error(t('messages:stopLoss.mustBePositive'));
      throw new Error('Invalid value');
    }
    
    await window.electronAPI.positions.updateInitialR(positionId, value);
    
    // 포지션 업데이트 이벤트 발생
    const position = positions.find(p => p.id === positionId);
    if (position) {
      // 테이블 데이터 새로고침 (store 업데이트가 자동으로 모든 구독자에게 전파됨)
      const { loadPositions } = useTradingStore.getState();
      await loadPositions();
      
      // 업데이트된 포지션 가져와서 메트릭 재계산
      const updatedPosition = useTradingStore.getState().positions.find(p => p.id === positionId);
      if (updatedPosition) {
        const { calculateAndCachePositionMetrics } = useMetricsStore.getState();
        calculateAndCachePositionMetrics(updatedPosition);
      }
    }
    
    message.success(t('messages:stopLoss.updateSuccess'));
  }, [positions, message]);


  // 컬럼 정의 매핑
  const columnDefinitions: Record<string, ColumnDef<Position>> = {
    ticker: {
      accessorKey: 'ticker',
      header: 'Ticker',
      size: 120,
      cell: ({ row }) => {
        const position = row.original;
        const isKorean = activeAccount?.accountType === 'KR';
        
        // 한국장인 경우: 종목명을 메인으로, 티커 코드를 서브로
        // 미국장인 경우: 티커를 메인으로, 종목명을 서브로
        if (isKorean && position.tickerName) {
          return (
            <Space direction="vertical" size={0}>
              <Text strong>{position.tickerName}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {position.ticker.replace('.KS', '')}
              </Text>
            </Space>
          );
        }
        
        // 미국장: 티커를 메인으로, 종목명이 있으면 서브로
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{position.ticker}</Text>
            {position.tickerName && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {position.tickerName}
              </Text>
            )}
          </Space>
        );
      },
    },
    setup: {
      accessorKey: 'setupType',
      header: 'Setup',
      size: 150,
      cell: ({ row }) => {
        const position = row.original;
        return (
          <Select
            value={position.setupType}
            placeholder="Setup"
            style={{ width: '100%' }}
            size="small"
            onChange={(value) => {
              updatePosition(position.id, { setupType: value });
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {generalSettings.setupCategories?.map((category) => (
              <Select.Option key={category} value={category}>
                {category}
              </Select.Option>
            ))}
          </Select>
        );
      },
    },
    rating: {
      accessorKey: 'rating',
      header: 'Rating',
      size: 120,
      cell: ({ row }) => {
        const position = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Rate
              value={position.rating || 0}
              onChange={(value) => {
                updatePosition(position.id, { rating: value });
              }}
              style={{ fontSize: 14 }}
            />
          </div>
        );
      },
    },
    memo: {
      accessorKey: 'memo',
      header: 'Memo',
      size: 80,
      cell: ({ row }) => {
        const position = row.original;
        return (
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setMemoModalPosition(position);
              setMemoModalVisible(true);
            }}
          />
        );
      },
    },
    size: {
      accessorKey: 'size',
      header: 'Size',
      size: 80,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? formatPercent(value) : '-';
      },
    },
    maxSize: {
      accessorKey: 'maxSize',
      header: 'Max Size',
      size: 80,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? formatPercent(value) : '-';
      },
    },
    avgPrice: {
      accessorKey: 'avgBuyPrice',
      header: 'Avg. Price',
      size: 100,
      cell: ({ getValue }) => {
        const value = getValue() as Decimal;
        return value ? formatCurrency(value, activeAccount?.currency) : '-';
      },
    },
    realizedPnl: {
      accessorKey: 'realizedPnl',
      header: 'Realized P&L',
      size: 100,
      cell: ({ getValue }) => {
        const value = getValue() as Decimal;
        if (!value) return '-';
        const color = value.greaterThan(0) ? '#52c41a' : value.lessThan(0) ? '#ff4d4f' : undefined;
        return (
          <Text style={{ color, fontWeight: 'bold' }}>
            {formatCurrency(value, activeAccount?.currency)}
          </Text>
        );
      },
    },
    aumPnl: {
      accessorKey: 'aumPnlPercent',
      header: 'AUM PnL%',
      size: 100,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        if (value === undefined || value === null) return '-';
        const color = value >= 0 ? '#52c41a' : '#ff4d4f';
        return (
          <Text style={{ color, fontWeight: 'bold' }}>
            {formatPercent(value)}
          </Text>
        );
      },
    },
    initialR: {
      accessorKey: 'initialR',
      header: 'Initial R',
      size: 140,
      cell: ({ row }) => {
        const position = row.original as Position;
        return <InitialREditCell position={position} onSave={handleSaveInitialR} />;
      },
    },
    rMultiple: {
      accessorKey: 'rMultiple',
      header: 'R-Multiple',
      size: 100,
      cell: ({ getValue, row }) => {
        const value = getValue() as number;
        const position = row.original as Position;
        
        if (!position.initialR) {
          return <Text type="secondary">-</Text>;
        }
        
        if (value === null || value === undefined) return '-';
        
        const color = value >= 0 ? '#52c41a' : '#ff4d4f';
        return (
          <Text style={{ color, fontWeight: 'bold' }}>
            {value.toFixed(2)}R
          </Text>
        );
      },
    },
    pureRisk: {
      accessorKey: 'pureRisk',
      header: 'Open Risk %',
      size: 100,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? (
          <Text type={value > 2 ? 'danger' : 'secondary'}>
            {formatPercent(value)}
          </Text>
        ) : '-';
      },
    },
    totalRisk: {
      accessorKey: 'totalRisk',
      header: 'Net Risk %',
      size: 100,
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? (
          <Text type={value > 5 ? 'danger' : 'secondary'}>
            {formatPercent(value)}
          </Text>
        ) : '-';
      },
    },
    stopLoss: {
      accessorKey: 'stopLoss',
      header: 'Stop Loss',
      size: 140,
      cell: ({ row }) => {
        const position = row.original as Position;
        return <StopLossEditPopover position={position} />;
      },
    },
  };

  const columns: ColumnDef<Position>[] = [
    {
      id: 'actions',
      header: '',
      size: 40,
      cell: ({ row }) => (
        <Button
          type="text"
          size="small"
          icon={<RightOutlined />}
          onClick={() => handleAction(row.original)}
        />
      ),
    },
    ...columnConfigs
      .filter(config => config.visible)
      .sort((a, b) => a.order - b.order)
      .map(config => columnDefinitions[config.key])
      .filter(Boolean),
  ];

  const table = useReactTable({
    data: positionsWithMetrics,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id, // 포지션의 고유 ID를 행 ID로 사용
  });

  // Ant Design Table columns 변환
  const antdColumns = table.getHeaderGroups()[0].headers.map(header => ({
    key: header.id,
    title: header.column.columnDef.header as string,
    dataIndex: header.column.id,
    width: header.getSize(),
    sorter: header.column.getCanSort() ? true : false,
    render: (_: unknown, record: Position) => {
      const cell = table.getRowModel().rows
        .find(row => row.original.id === record.id)
        ?.getVisibleCells()
        .find(cell => cell.column.id === header.id);
      
      return cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null;
    },
  }));

  return (
    <div style={{ minHeight: 550 }}>
      <Table
        columns={antdColumns}
        dataSource={positionsWithMetrics}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100', '200'],
          showTotal: (total) => t('widgets:positionTable.totalPositions', { total }),
          onChange: (page, size) => {
            setCurrentPage(page);
            if (size !== pageSize) {
              setPageSize(size!);
              setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로 이동
            }
          },
          onShowSizeChange: (_, size) => {
            setPageSize(size);
            setCurrentPage(1);
          }
        }}
        size="small"
        scroll={{ 
          x: responsive.isCompact ? 800 : 1200, 
          y: responsive.isCompact ? 300 : 420 
        }}
      />

      <ModalManager
        visible={modalVisible}
        position={selectedPosition}
        onClose={() => {
          setModalVisible(false);
          setSelectedPosition(null);
        }}
      />
      
      <PositionMemoModal
        visible={memoModalVisible}
        position={memoModalPosition}
        onClose={() => {
          setMemoModalVisible(false);
          setMemoModalPosition(null);
        }}
      />
    </div>
  );
};

export default React.memo(TradingTable, (prevProps, nextProps) => {
  // positions 배열의 길이가 다르면 리렌더링
  if (prevProps.positions.length !== nextProps.positions.length) {
    return false;
  }
  
  // 각 포지션의 주요 필드 비교
  return prevProps.positions.every((prevPos, index) => {
    const nextPos = nextProps.positions[index];
    // stopLosses나 maxRiskAmount 변경 시 리렌더링
    const stopLossesEqual = prevPos.stopLosses?.length === nextPos.stopLosses?.length;
    const maxRiskEqual = (!prevPos.maxRiskAmount && !nextPos.maxRiskAmount) ||
                         (prevPos.maxRiskAmount?.equals(nextPos.maxRiskAmount || new Decimal(0)) ?? false);
    
    return prevPos.id === nextPos.id &&
           prevPos.totalShares === nextPos.totalShares &&
           stopLossesEqual &&
           maxRiskEqual &&
           prevPos.setupType === nextPos.setupType &&
           prevPos.rating === nextPos.rating &&
           prevPos.memo === nextPos.memo;
  });
});