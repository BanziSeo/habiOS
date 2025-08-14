import { net } from 'electron';
import { Decimal } from 'decimal.js';

export interface BenchmarkData {
  date: string;
  value: number;
  symbol: string;
}

// 벤치마크 심볼 매핑
const BENCHMARK_SYMBOLS = {
  SPY: 'SPY',
  QQQ: 'QQQ', 
  KOSPI: '^KS11',
  KOSDAQ: '^KQ11'
};

// Yahoo Finance API를 통해 벤치마크 데이터 가져오기
export async function fetchBenchmarkData(
  symbol: keyof typeof BENCHMARK_SYMBOLS,
  startDate: Date,
  endDate: Date
): Promise<BenchmarkData[]> {
  const yahooSymbol = BENCHMARK_SYMBOLS[symbol];
  
  try {
    const period1 = Math.floor(startDate.getTime() / 1000);
    const period2 = Math.floor(endDate.getTime() / 1000);
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${period1}&period2=${period2}&interval=1d&includePrePost=false`;
    
    return new Promise((resolve, reject) => {
      const request = net.request({
        url,
        method: 'GET'
      });
      
      request.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      let responseData = '';
      
      request.on('response', (response) => {
        response.on('data', (chunk) => {
          responseData += chunk;
        });
        
        response.on('end', () => {
          try {
            const data = JSON.parse(responseData);
            const result = data.chart.result[0];
            const timestamps = result.timestamp;
            const quotes = result.indicators.quote[0];
            const closes = quotes.close;
            
            if (!timestamps || !closes) {
              resolve([]);
              return;
            }
            
            // 첫 번째 유효한 가격을 기준점으로 설정
            let basePrice: number | null = null;
            const benchmarkData: BenchmarkData[] = [];
            
            for (let i = 0; i < timestamps.length; i++) {
              const close = closes[i];
              if (close !== null) {
                if (basePrice === null) {
                  basePrice = close;
                }
                
                // 수익률을 기반으로 한 인덱스 값 계산 (100 기준)
                const returnPercent = new Decimal(close - basePrice).dividedBy(basePrice).times(100);
                const indexValue = new Decimal(100).plus(returnPercent).toNumber();
                
                benchmarkData.push({
                  date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
                  value: indexValue,
                  symbol
                });
              }
            }
            
            resolve(benchmarkData);
          } catch (error) {
            console.error(`Failed to parse benchmark data for ${symbol}:`, error);
            resolve([]);
          }
        });
      });
      
      request.on('error', (error) => {
        console.error(`Failed to fetch benchmark data for ${symbol}:`, error);
        resolve([]);
      });
      
      request.end();
    });
  } catch (error) {
    console.error(`Failed to fetch benchmark data for ${symbol}:`, error);
    return [];
  }
}

// 여러 벤치마크 데이터를 동시에 가져오기
export async function fetchMultipleBenchmarks(
  symbols: (keyof typeof BENCHMARK_SYMBOLS)[],
  startDate: Date,
  endDate: Date
): Promise<{ [key: string]: BenchmarkData[] }> {
  const promises = symbols.map(symbol => 
    fetchBenchmarkData(symbol, startDate, endDate)
      .then(data => ({ symbol, data }))
  );
  
  const results = await Promise.all(promises);
  
  return results.reduce((acc, { symbol, data }) => {
    acc[symbol] = data;
    return acc;
  }, {} as { [key: string]: BenchmarkData[] });
}