import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import { Decimal } from 'decimal.js';
import { importCSV, calculateHistoricalEquityCurve, calculateAppendEquityCurve } from '../../../services/csvImport';
import { useTradingStore } from '../../../stores/tradingStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { withLoading } from '../../../stores/loadingStore';
import { normalizePositionFromDB, normalizeTradeFromDB } from '../../../utils/dbNormalizer';
import type { ImportType, ImportResult, ImportStats } from '../types';

export const useImportLogic = () => {
  const { t } = useTranslation('csvImport');
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { importCSV: importToStore, activeAccount } = useTradingStore();
  
  const [importType, setImportType] = useState<ImportType>('APPEND');
  const [currentAssets, setCurrentAssets] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    if (!isCSV) {
      message.error(t('error.csvOnly'));
      return;
    }
    setSelectedFile(file);
    setImportResult(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      message.error(t('error.selectFile'));
      return;
    }

    if (importType === 'FULL' && !currentAssets) {
      message.error(t('error.enterAssets'));
      return;
    }

    setImporting(true);
    setImportProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // 진행률 시뮬레이션
      progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const accountId = activeAccount?.id || 'default-account';
      const accountType = activeAccount?.accountType || 'US';
      
      console.log('[Import Logic] activeAccount:', activeAccount);
      console.log('[Import Logic] accountType 결정:', accountType);
      
      const { generalSettings } = useSettingsStore.getState();
      const buyCommissionRate = generalSettings.buyCommissionRate || 0.0007;
      const sellCommissionRate = generalSettings.sellCommissionRate || 0.0007;
      
      let existingData = undefined;
      
      // APPEND 모드일 때 기존 데이터 로드
      if (importType === 'APPEND') {
        try {
          const [existingPositions, existingTrades] = await Promise.all([
            window.electronAPI.positions.getByAccount(accountId),
            window.electronAPI.trades.getByAccount(accountId)
          ]);
          
          existingData = {
            positions: existingPositions.map(normalizePositionFromDB),
            trades: existingTrades.map(normalizeTradeFromDB)
          };
        } catch (error) {
          message.error('기존 데이터를 불러오는데 실패했습니다.');
          setImporting(false);
          return;
        }
      }
      
      const result = await withLoading(
        'csv-import',
        'CSV 파일을 분석하고 있습니다...',
        () => importCSV(
          selectedFile,
          importType,
          accountId,
          currentAssets ? new Decimal(currentAssets) : undefined,
          buyCommissionRate,
          sellCommissionRate,
          existingData,
          accountType
        )
      );

      clearInterval(progressInterval);
      setImportProgress(90);

      // Equity curve 계산
      let equityCurveData = null;
      if (importType === 'FULL' && currentAssets) {
        try {
          equityCurveData = calculateHistoricalEquityCurve(
            result.trades,
            result.positions,
            new Decimal(currentAssets),
            buyCommissionRate,
            sellCommissionRate
          );
        } catch (error) {
          result.errors.push('Equity curve 계산 중 오류가 발생했습니다.');
        }
      } else if (importType === 'APPEND') {
        try {
          const lastEquityData = await window.electronAPI.equityCurve.getLatest(accountId);
          
          if (lastEquityData) {
            equityCurveData = calculateAppendEquityCurve(
              result.trades,
              result.positions,
              {
                date: new Date(lastEquityData.date),
                totalValue: new Decimal(lastEquityData.total_value)
              },
              buyCommissionRate,
              sellCommissionRate
            );
          }
        } catch (error) {
          result.errors.push('Equity curve 업데이트 중 오류가 발생했습니다.');
        }
      }

      // Zustand 스토어를 통해 데이터베이스에 저장
      let importStats: ImportStats | undefined = undefined;
      if (result.trades.length > 0) {
        try {
          const importResult = await importToStore({
            trades: result.trades,
            positions: result.positions,
            importType,
            currentTotalAssets: currentAssets ? new Decimal(currentAssets) : undefined,
            equityCurveData: equityCurveData || undefined
          });
          
          // 백엔드에서 반환한 실제 통계값 사용
          importStats = importType === 'APPEND' ? 
            { 
              savedTrades: importResult.savedTradesCount || 0, 
              skippedTrades: importResult.skippedTradesCount || 0, 
              savedPositions: importResult.savedPositionsCount || 0, 
              skippedPositions: importResult.skippedPositionsCount || 0, 
              totalTrades: result.trades.length, 
              totalPositions: result.positions.length,
              duplicateTrades: importResult.skippedTradesCount || 0,
              newTrades: importResult.savedTradesCount || 0,
              updatedPositions: 0,
              newPositions: importResult.savedPositionsCount || 0
            } : 
            {
              savedTrades: result.trades.length,
              skippedTrades: 0,
              savedPositions: result.positions.length,
              skippedPositions: 0,
              totalTrades: result.trades.length,
              totalPositions: result.positions.length,
              duplicateTrades: 0,
              newTrades: result.trades.length,
              updatedPositions: 0,
              newPositions: result.positions.length
            };
        } catch (error: unknown) {
          result.errors.push((error as Error).message || t('error.dbError'));
        }
      }

      setImportProgress(100);
      setImportResult({ ...result, stats: importStats });

      if (result.errors.length === 0) {
        if (importStats && importType === 'APPEND') {
          message.success(
            t('success.importComplete', {
              savedTrades: importStats.savedTrades,
              skippedTrades: importStats.skippedTrades,
              savedPositions: importStats.savedPositions,
              skippedPositions: importStats.skippedPositions
            })
          );
        } else {
          message.success(t('success.importSuccess', { 
            trades: result.trades.length, 
            positions: result.positions.length 
          }));
        }
        
        // 2초 후 매매일지 페이지로 이동
        setTimeout(() => {
          navigate('/journal');
        }, 2000);
      } else {
        message.warning(t('error.someErrors'));
      }
    } catch (error) {
      message.error(t('error.importError'));
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setImporting(false);
    }
  };

  return {
    importType,
    setImportType,
    currentAssets,
    setCurrentAssets,
    importing,
    importProgress,
    importResult,
    selectedFile,
    handleFileSelect,
    handleFileRemove,
    handleImport,
  };
};