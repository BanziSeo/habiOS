import { ipcMain, dialog } from 'electron';

export function registerUtilityHandlers() {
  // 파일 다이얼로그
  ipcMain.handle('dialog:openFile', async (event, options) => {
    const result = await dialog.showOpenDialog(options);
    return result;
  });

  // 가격 데이터 가져오기 (Yahoo Finance)
  ipcMain.handle('fetch-price-data', async (event, symbol: string, days: number = 730, interval: string = '1d') => {
    try {
      // interval별 최대 기간 제한
      const maxDays: Record<string, number> = {
        '1m': 7,
        '2m': 7,
        '5m': 7,
        '15m': 7,
        '30m': 7,
        '60m': 730, // 2년 (6개월보다 넉넉하게)
        '1h': 730,   // 2년 (6개월보다 넉넉하게)
        '1d': 1825,  // 5년
        '1wk': 1825, // 5년
        '1mo': 1825  // 5년
      };

      // 최대 기간 제한 적용
      const maxAllowedDays = maxDays[interval] || 730;
      const adjustedDays = Math.min(days, maxAllowedDays);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - adjustedDays);
      
      const period1 = Math.floor(startDate.getTime() / 1000);
      const period2 = Math.floor(endDate.getTime() / 1000);
      
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}&includePrePost=false`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data = await response.json();
      const quotes = data.chart.result[0];
      const timestamps = quotes.timestamp;
      const ohlc = quotes.indicators.quote[0];
      
      // 디버깅: 마지막 데이터 날짜 확인
      if (timestamps && timestamps.length > 0) {
        const lastTimestamp = timestamps[timestamps.length - 1];
        const lastDate = new Date(lastTimestamp * 1000).toISOString();
        console.log(`[${symbol}] Last data: ${lastDate}, Total: ${timestamps.length} candles`);
      }
      
      // 프론트엔드가 기대하는 형식으로 변환
      const formattedData = timestamps.map((timestamp: number, i: number) => ({
        timestamp: timestamp * 1000, // 밀리초 단위
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: ohlc.open[i],
        high: ohlc.high[i],
        low: ohlc.low[i],
        close: ohlc.close[i],
        volume: ohlc.volume[i]
      })).filter((item) => 
        item.open !== null && 
        item.high !== null && 
        item.low !== null && 
        item.close !== null
      );
      
      return {
        success: true,
        data: formattedData,
        symbol: symbol,
        interval: interval,
        actualDays: adjustedDays
      };
    } catch (error: unknown) {
      console.error('Failed to fetch price data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        symbol: symbol
      };
    }
  });
}