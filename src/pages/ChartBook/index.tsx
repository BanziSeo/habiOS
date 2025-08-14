import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Empty, 
  Button, 
  Modal, 
  Image,
  Tag,
  Popconfirm,
  Spin,
  Typography
} from 'antd';
import { 
  SearchOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CalendarOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useChartBookStore, type ChartSnapshot } from '../../stores/chartBookStore';
import styles from './ChartBook.module.css';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const ChartBook: React.FC = () => {
  const { t } = useTranslation('chartbook');
  const { 
    charts, 
    searchCharts, 
    deleteChart, 
    updateChart,
    isLoading 
  } = useChartBookStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicker, setSelectedTicker] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedChart, setSelectedChart] = useState<ChartSnapshot | null>(null);
  const [editingMemo, setEditingMemo] = useState(false);
  const [tempMemo, setTempMemo] = useState('');

  // 필터링된 차트 목록
  const filteredCharts = React.useMemo(() => {
    let result = searchQuery ? searchCharts(searchQuery) : charts;
    
    if (selectedTicker !== 'all') {
      result = result.filter(chart => chart.ticker === selectedTicker);
    }
    
    if (selectedTimeframe !== 'all') {
      result = result.filter(chart => chart.timeframe === selectedTimeframe);
    }
    
    // 날짜 기준 내림차순 정렬
    return result.sort((a, b) => b.captureDate.getTime() - a.captureDate.getTime());
  }, [charts, searchQuery, selectedTicker, selectedTimeframe, searchCharts]);

  // 유니크한 티커 목록
  const uniqueTickers = React.useMemo(() => {
    const tickers = new Set(charts.map(chart => chart.ticker));
    return Array.from(tickers).sort();
  }, [charts]);

  // 유니크한 타임프레임 목록
  const uniqueTimeframes = React.useMemo(() => {
    const timeframes = new Set(charts.map(chart => chart.timeframe));
    return Array.from(timeframes).sort((a, b) => {
      const order = ['1m', '2m', '3m', '5m', '10m', '15m', '30m', '60m', '65m', '1d', '1wk'];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [charts]);

  const handleViewChart = (chart: ChartSnapshot) => {
    setSelectedChart(chart);
    setViewerVisible(true);
    setTempMemo(chart.memo || '');
  };

  const handleDeleteChart = async (chartId: string) => {
    try {
      await deleteChart(chartId);
    } catch (error) {
      console.error('Failed to delete chart:', error);
    }
  };

  const handleSaveMemo = async () => {
    if (selectedChart) {
      try {
        await updateChart(selectedChart.id, { memo: tempMemo });
        setSelectedChart({ ...selectedChart, memo: tempMemo });
        setEditingMemo(false);
      } catch (error) {
        console.error('Failed to update memo:', error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2}>{t('title')}</Title>
        <Text type="secondary">{t('description')}</Text>
      </div>

      {/* 필터 섹션 */}
      <Card className={styles.filterCard}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder={t('filter.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={setSearchQuery}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={selectedTicker}
              onChange={setSelectedTicker}
              style={{ width: '100%' }}
              placeholder={t('filter.selectTicker')}
            >
              <Option value="all">{t('filter.allTickers')}</Option>
              {uniqueTickers.map(ticker => (
                <Option key={ticker} value={ticker}>{ticker}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              value={selectedTimeframe}
              onChange={setSelectedTimeframe}
              style={{ width: '100%' }}
              placeholder={t('filter.selectTimeframe')}
            >
              <Option value="all">{t('filter.allTimeframes')}</Option>
              {uniqueTimeframes.map(tf => (
                <Option key={tf} value={tf}>
                  {t(`timeframes.${tf}`, tf)}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
            <Text type="secondary">
              {t('filter.totalCharts', { count: filteredCharts.length })}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* 차트 그리드 */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredCharts.length === 0 ? (
        <Empty
          description={
            searchQuery || selectedTicker !== 'all' || selectedTimeframe !== 'all'
              ? t('empty.noResults')
              : t('empty.noCharts')
          }
          style={{ marginTop: 100 }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCharts.map((chart) => (
            <Col key={chart.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                className={styles.chartCard}
                cover={
                  <div className={styles.imageWrapper}>
                    <img
                      alt={`${chart.ticker} ${t('title')}`}
                      src={chart.imageDataUrl}
                      className={styles.chartImage}
                      onClick={() => handleViewChart(chart)}
                    />
                    <div className={styles.imageOverlay}>
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewChart(chart)}
                      >
                        {t('chartCard.viewLarge')}
                      </Button>
                    </div>
                  </div>
                }
                actions={[
                  <Button
                    key="view"
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewChart(chart)}
                  />,
                  <Popconfirm
                    key="delete"
                    title={t('chartCard.confirmDelete')}
                    onConfirm={() => handleDeleteChart(chart.id)}
                    okText={t('chartCard.delete')}
                    cancelText={t('viewer.cancel')}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                ]}
              >
                <Card.Meta
                  title={
                    <div className={styles.cardTitle}>
                      <Tag color="blue">{chart.ticker}</Tag>
                      <Tag>{t(`timeframes.${chart.timeframe}`, chart.timeframe)}</Tag>
                    </div>
                  }
                  description={
                    <div className={styles.cardDescription}>
                      <div className={styles.dateInfo}>
                        <CalendarOutlined />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDate(chart.captureDate)}
                        </Text>
                      </div>
                      {chart.memo && (
                        <Paragraph 
                          ellipsis={{ rows: 2 }} 
                          style={{ marginTop: 8, marginBottom: 0 }}
                        >
                          {chart.memo}
                        </Paragraph>
                      )}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 차트 뷰어 모달 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="blue">{selectedChart?.ticker}</Tag>
            <Tag>{selectedChart && t(`timeframes.${selectedChart.timeframe}`, selectedChart.timeframe)}</Tag>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {selectedChart && formatDate(selectedChart.captureDate)}
            </Text>
          </div>
        }
        open={viewerVisible}
        onCancel={() => {
          setViewerVisible(false);
          setEditingMemo(false);
        }}
        width="90%"
        style={{ maxWidth: 1200 }}
        footer={[
          <Button key="close" onClick={() => setViewerVisible(false)}>
            {t('viewer.close')}
          </Button>,
          <Popconfirm
            key="delete"
            title={t('chartCard.confirmDelete')}
            onConfirm={() => {
              if (selectedChart) {
                handleDeleteChart(selectedChart.id);
                setViewerVisible(false);
              }
            }}
            okText={t('chartCard.delete')}
            cancelText={t('viewer.cancel')}
          >
            <Button danger icon={<DeleteOutlined />}>
              {t('chartCard.delete')}
            </Button>
          </Popconfirm>
        ]}
      >
        {selectedChart && (
          <div className={styles.viewerContent}>
            <Image
              src={selectedChart.imageDataUrl}
              alt={`${selectedChart.ticker} ${t('title')}`}
              style={{ width: '100%' }}
            />
            
            <Card style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Title level={5} style={{ margin: 0 }}>{t('viewer.memo')}</Title>
                {!editingMemo && (
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => setEditingMemo(true)}
                  >
                    {t('viewer.edit')}
                  </Button>
                )}
              </div>
              
              {editingMemo ? (
                <div>
                  <Input.TextArea
                    value={tempMemo}
                    onChange={(e) => setTempMemo(e.target.value)}
                    rows={4}
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Button 
                      onClick={() => {
                        setEditingMemo(false);
                        setTempMemo(selectedChart.memo || '');
                      }}
                      style={{ marginRight: 8 }}
                    >
                      {t('viewer.cancel')}
                    </Button>
                    <Button type="primary" onClick={handleSaveMemo}>
                      {t('viewer.save')}
                    </Button>
                  </div>
                </div>
              ) : (
                <Paragraph style={{ marginBottom: 0 }}>
                  {selectedChart.memo || <Text type="secondary">{t('viewer.noMemo')}</Text>}
                </Paragraph>
              )}
            </Card>

            {selectedChart.metadata && (
              <Card style={{ marginTop: 16 }}>
                <Title level={5}>{t('viewer.chartInfo')}</Title>
                <Row gutter={[16, 8]}>
                  {selectedChart.metadata.avgPrice && (
                    <Col span={12}>
                      <Text type="secondary">{t('viewer.avgPrice')}:</Text> ${selectedChart.metadata.avgPrice.toFixed(2)}
                    </Col>
                  )}
                  {selectedChart.metadata.currentPrice && (
                    <Col span={12}>
                      <Text type="secondary">{t('viewer.currentPrice')}:</Text> ${selectedChart.metadata.currentPrice.toFixed(2)}
                    </Col>
                  )}
                  {selectedChart.metadata.indicators && selectedChart.metadata.indicators.length > 0 && (
                    <Col span={24}>
                      <Text type="secondary">{t('viewer.indicators')}:</Text> {selectedChart.metadata.indicators.join(', ')}
                    </Col>
                  )}
                </Row>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChartBook;