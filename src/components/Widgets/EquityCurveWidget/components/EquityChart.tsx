import React from 'react';
import { Empty, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartTooltip } from '../../../../components/Common/ChartTooltip';
import type { ChartData, ChartSettings } from '../types';
import type { Account } from '../../../../types';
import { BENCHMARK_OPTIONS, CHART_MARGIN, CHART_HEIGHT } from '../constants';
import { formatPercentage } from '../utils/chartDataTransform';
import { formatCurrency } from '../../../../utils/formatters';
import { Decimal } from 'decimal.js';

interface EquityChartProps {
  data: ChartData[];
  settings: ChartSettings;
  showPercentage: boolean;
  selectedBenchmarks: string[];
  activeAccount?: Account;
}

export const EquityChart: React.FC<EquityChartProps> = ({
  data,
  settings,
  showPercentage,
  selectedBenchmarks,
  activeAccount
}) => {
  const { t } = useTranslation('equityCurve');
  const { token } = theme.useToken();
  // 커스텀 툴팁 렌더 함수
  const renderTooltipContent = (payload: any[], label?: string) => {  // intentional-any: Recharts 호환
    return (
      <>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '14px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '2px 0', fontSize: '13px', color: entry.color }}>
            {entry.name}: {
              showPercentage 
                ? formatPercentage(entry.value, 2)
                : formatCurrency(new Decimal(entry.value), activeAccount?.currency)
            }
          </p>
        ))}
      </>
    );
  };

  const CustomTooltip = (props: any) => (  // intentional-any: Recharts props
    <ChartTooltip 
      {...props} 
      renderContent={renderTooltipContent}
      backgroundColor="rgba(42, 42, 42, 0.95)"
      padding="12px"
      border="1px solid rgba(255, 255, 255, 0.15)"
      borderRadius="8px"
    />
  );

  if (data.length === 0) {
    return <Empty description={t('messages.noData')} />;
  }

  return (
    <div style={{ 
      padding: '16px',
      backgroundColor: settings.backgroundColor && settings.backgroundColor !== '' ? settings.backgroundColor : 'transparent',
      borderRadius: '8px'
    }}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart
          data={data}
          margin={CHART_MARGIN}
        >
          {settings.showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={settings.gridColor && settings.gridColor !== '' ? settings.gridColor : token.colorBorder} 
            />
          )}
          <XAxis 
            dataKey="displayDate" 
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tickFormatter={(value) => 
              showPercentage 
                ? formatPercentage(value)
                : formatCurrency(new Decimal(value), activeAccount?.currency)
            }
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* 포트폴리오 라인 */}
          <Line
            type="monotone"
            dataKey="portfolio"
            stroke={settings.portfolioLineColor}
            strokeWidth={settings.portfolioLineWidth}
            dot={false}
            name="Portfolio"
          />
          
          {/* 이동평균선 */}
          {settings.movingAverages.map(ma => 
            ma.enabled && (
              <Line
                key={ma.id}
                type="monotone"
                dataKey={ma.id}
                stroke={ma.color}
                strokeWidth={ma.width}
                dot={false}
                name={`${ma.period} ${ma.type}`}
                strokeDasharray={ma.lineStyle === 'dashed' ? "5 3" : "0"}
              />
            )
          )}
          
          {/* 벤치마크 라인 */}
          {BENCHMARK_OPTIONS.map(benchmark => 
            selectedBenchmarks.includes(benchmark.value) && (
              <Line
                key={benchmark.value}
                type="monotone"
                dataKey={benchmark.value}
                stroke={benchmark.color}
                strokeWidth={2}
                dot={false}
                name={benchmark.label.split(' ')[0]} // 'S&P 500 (SPY)' → 'S&P'
              />
            )
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};