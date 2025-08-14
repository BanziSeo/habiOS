import { notifyNetworkError } from '../utils/errorNotification';

interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class PriceService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1초

  async fetchPriceData(symbol: string, days: number = 730, interval?: string): Promise<PriceData[]> {
    // 캐시 확인 제거 - 항상 새로운 데이터 요청
    
    // 재시도 로직과 함께 데이터 가져오기
    let retries = 0;
    while (retries < this.MAX_RETRIES) {
      try {
        const result = await window.electronAPI.fetchPriceData(symbol, days, interval);
        
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.error || 'Failed to fetch price data');
        }
      } catch (error) {
        retries++;
        // 마지막 시도가 아니면 콘솔에만 출력
        if (retries === this.MAX_RETRIES) {
          notifyNetworkError(`${symbol} 가격 데이터를 가져올 수 없습니다.`);
        }
        console.error(`Attempt ${retries} failed for ${symbol}:`, error);
        
        if (retries < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        } else {
          throw error;
        }
      }
    }

    throw new Error('Max retries exceeded');
  }

  // chart-0714 라이브러리가 요구하는 형식으로 변환
  formatForChart(data: PriceData[]): Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }> {
    return data.map(candle => ({
      date: new Date(candle.timestamp).toISOString().split('T')[0], // YYYY-MM-DD
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume
    }));
  }
}

export const priceService = new PriceService();