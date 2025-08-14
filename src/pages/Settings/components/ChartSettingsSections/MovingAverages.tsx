import React, { useState, useMemo } from 'react';
import { Table, Button, InputNumber, Select, ColorPicker, Switch, Popconfirm, Tabs, message, Dropdown } from 'antd';
import { PlusOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { useSettingsStore, type MovingAverage } from '../../../../stores/settingsStore';
import { formatColor } from '../../../../utils/colorUtils';

// 타임프레임 옵션 (ChartModal과 동일)
const TIMEFRAME_OPTIONS = [
  { value: '1m', label: '1분' },
  { value: '2m', label: '2분' },
  { value: '3m', label: '3분' },
  { value: '5m', label: '5분' },
  { value: '10m', label: '10분' },
  { value: '15m', label: '15분' },
  { value: '30m', label: '30분' },
  { value: '60m', label: '60분' },
  { value: '65m', label: '65분' },
  { value: '1d', label: '일봉' },
  { value: '1wk', label: '주봉' },
];

export const MovingAverages: React.FC = () => {
  const {
    chartSettings,
    addPriceMA,
    updatePriceMA,
    removePriceMA,
    addVolumeMA,
    updateVolumeMA,
    removeVolumeMA,
    addTimeframePriceMA,
    updateTimeframePriceMA,
    removeTimeframePriceMA,
    addTimeframeVolumeMA,
    updateTimeframeVolumeMA,
    removeTimeframeVolumeMA,
    copyTimeframeSettings,
  } = useSettingsStore();
  
  const [activeTab, setActiveTab] = useState('global');

  // 새로운 이동평균선 생성 함수
  const createNewMA = (): MovingAverage => ({
    id: Date.now().toString(),
    period: 20,
    type: 'SMA',
    color: '#' + Math.floor(Math.random()*16777215).toString(16),
    width: 1,
    enabled: true,
  });
  
  // 현재 탭의 데이터 가져오기
  const getCurrentData = useMemo(() => {
    if (activeTab === 'global') {
      return {
        priceMA: chartSettings.priceMovingAverages,
        volumeMA: chartSettings.volumeMovingAverages,
      };
    } else {
      const timeframeSettings = chartSettings.timeframeMA?.[activeTab];
      return {
        priceMA: timeframeSettings?.priceMovingAverages || [],
        volumeMA: timeframeSettings?.volumeMovingAverages || [],
      };
    }
  }, [activeTab, chartSettings]);

  // 이동평균선 추가 함수
  const handleAddPriceMA = () => {
    const newMA = createNewMA();
    if (activeTab === 'global') {
      addPriceMA(newMA);
    } else {
      addTimeframePriceMA(activeTab, newMA);
    }
  };

  const handleAddVolumeMA = () => {
    const newMA = createNewMA();
    if (activeTab === 'global') {
      addVolumeMA(newMA);
    } else {
      addTimeframeVolumeMA(activeTab, newMA);
    }
  };

  // 설정 복사 함수
  const handleCopySettings = (toTimeframe: string) => {
    copyTimeframeSettings(activeTab, toTimeframe);
    message.success(`${activeTab} 설정을 ${toTimeframe}로 복사했습니다.`);
  };

  const priceMAColumns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      width: 80,
      render: (period: number, record: MovingAverage) => (
        <InputNumber
          value={period}
          min={1}
          max={500}
          onChange={(value) => {
            if (activeTab === 'global') {
              updatePriceMA(record.id, { period: value || 1 });
            } else {
              updateTimeframePriceMA(activeTab, record.id, { period: value || 1 });
            }
          }}
          size="small"
        />
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string, record: MovingAverage) => (
        <Select
          value={type}
          onChange={(value) => {
            if (activeTab === 'global') {
              updatePriceMA(record.id, { type: value as 'SMA' | 'EMA' });
            } else {
              updateTimeframePriceMA(activeTab, record.id, { type: value as 'SMA' | 'EMA' });
            }
          }}
          size="small"
          style={{ width: '100%' }}
        >
          <Select.Option value="SMA">SMA</Select.Option>
          <Select.Option value="EMA">EMA</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      width: 120,
      render: (color: string, record: MovingAverage) => (
        <ColorPicker
          value={color}
          onChange={(value) => {
            if (activeTab === 'global') {
              updatePriceMA(record.id, { color: formatColor(value) });
            } else {
              updateTimeframePriceMA(activeTab, record.id, { color: formatColor(value) });
            }
          }}
          size="small"
        />
      ),
    },
    {
      title: 'Width',
      dataIndex: 'width',
      key: 'width',
      width: 80,
      render: (width: number, record: MovingAverage) => (
        <InputNumber
          value={width || 1}
          min={1}
          max={5}
          onChange={(value) => {
            if (activeTab === 'global') {
              updatePriceMA(record.id, { width: value || 1 });
            } else {
              updateTimeframePriceMA(activeTab, record.id, { width: value || 1 });
            }
          }}
          size="small"
        />
      ),
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record: MovingAverage) => (
        <Switch
          checked={enabled}
          onChange={(checked) => {
            if (activeTab === 'global') {
              updatePriceMA(record.id, { enabled: checked });
            } else {
              updateTimeframePriceMA(activeTab, record.id, { enabled: checked });
            }
          }}
          size="small"
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 60,
      render: (_: unknown, record: MovingAverage) => (
        <Popconfirm
          title="Delete this moving average?"
          onConfirm={() => {
            if (activeTab === 'global') {
              removePriceMA(record.id);
            } else {
              removeTimeframePriceMA(activeTab, record.id);
            }
          }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const volumeMAColumns = priceMAColumns.map(col => {
    // 각 컬럼의 onChange 핸들러를 볼륨용으로 변경
    if (col.key === 'period') {
      return {
        ...col,
        render: (period: number, record: MovingAverage) => (
          <InputNumber
            value={period}
            min={1}
            max={500}
            onChange={(value) => {
              if (activeTab === 'global') {
                updateVolumeMA(record.id, { period: value || 1 });
              } else {
                updateTimeframeVolumeMA(activeTab, record.id, { period: value || 1 });
              }
            }}
            size="small"
          />
        ),
      };
    }
    if (col.key === 'type') {
      return {
        ...col,
        render: (type: string, record: MovingAverage) => (
          <Select
            value={type}
            onChange={(value) => {
              if (activeTab === 'global') {
                updateVolumeMA(record.id, { type: value as 'SMA' | 'EMA' });
              } else {
                updateTimeframeVolumeMA(activeTab, record.id, { type: value as 'SMA' | 'EMA' });
              }
            }}
            size="small"
            style={{ width: '100%' }}
          >
            <Select.Option value="SMA">SMA</Select.Option>
            <Select.Option value="EMA">EMA</Select.Option>
          </Select>
        ),
      };
    }
    if (col.key === 'color') {
      return {
        ...col,
        render: (color: string, record: MovingAverage) => (
          <ColorPicker
            value={color}
            onChange={(value) => {
              if (activeTab === 'global') {
                updateVolumeMA(record.id, { color: formatColor(value) });
              } else {
                updateTimeframeVolumeMA(activeTab, record.id, { color: formatColor(value) });
              }
            }}
            size="small"
          />
        ),
      };
    }
    if (col.key === 'width') {
      return {
        ...col,
        render: (width: number, record: MovingAverage) => (
          <InputNumber
            value={width || 1}
            min={1}
            max={5}
            onChange={(value) => {
              if (activeTab === 'global') {
                updateVolumeMA(record.id, { width: value || 1 });
              } else {
                updateTimeframeVolumeMA(activeTab, record.id, { width: value || 1 });
              }
            }}
            size="small"
          />
        ),
      };
    }
    if (col.key === 'enabled') {
      return {
        ...col,
        render: (enabled: boolean, record: MovingAverage) => (
          <Switch
            checked={enabled}
            onChange={(checked) => {
              if (activeTab === 'global') {
                updateVolumeMA(record.id, { enabled: checked });
              } else {
                updateTimeframeVolumeMA(activeTab, record.id, { enabled: checked });
              }
            }}
            size="small"
          />
        ),
      };
    }
    if (col.key === 'action') {
      return {
        ...col,
        render: (_: unknown, record: MovingAverage) => (
          <Popconfirm
            title="Delete this moving average?"
            onConfirm={() => {
              if (activeTab === 'global') {
                removeVolumeMA(record.id);
              } else {
                removeTimeframeVolumeMA(activeTab, record.id);
              }
            }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        ),
      };
    }
    return col;
  });

  // 드롭다운 메뉴 아이템
  const copyMenuItems = TIMEFRAME_OPTIONS
    .filter(tf => tf.value !== activeTab)
    .map(tf => ({
      key: tf.value,
      label: `${tf.label}로 복사`,
      onClick: () => handleCopySettings(tf.value),
    }));

  // 탭 아이템 생성
  const tabItems = [
    {
      key: 'global',
      label: '전역 설정',
    },
    ...TIMEFRAME_OPTIONS.map(tf => ({
      key: tf.value,
      label: tf.label,
    })),
  ];

  // 현재 탭의 설정 표시 컨텐츠
  const renderSettingsContent = () => (
    <>
      {/* 타임프레임별 설정일 경우 복사 버튼 표시 */}
      {activeTab !== 'global' && (
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Dropdown menu={{ items: copyMenuItems }} placement="bottomRight">
            <Button icon={<CopyOutlined />}>
              다른 타임프레임에서 복사
            </Button>
          </Dropdown>
        </div>
      )}
      
      {/* Price Moving Averages */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h4 style={{ margin: 0 }}>Price Moving Averages</h4>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPriceMA}
            size="small"
          >
            Add MA
          </Button>
        </div>
        <Table
          dataSource={getCurrentData.priceMA}
          columns={priceMAColumns}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: '설정된 이동평균선이 없습니다' }}
        />
      </div>

      {/* Volume Moving Averages */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h4 style={{ margin: 0 }}>Volume Moving Averages</h4>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddVolumeMA}
            size="small"
          >
            Add MA
          </Button>
        </div>
        <Table
          dataSource={getCurrentData.volumeMA}
          columns={volumeMAColumns}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: '설정된 이동평균선이 없습니다' }}
        />
      </div>
    </>
  );

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        type="card"
      />
      {renderSettingsContent()}
    </div>
  );
};