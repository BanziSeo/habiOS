import type { Trade, Position } from '../../types/index.js';

export type ImportType = 'FULL' | 'APPEND';

export interface ImportStats {
  totalTrades: number;
  totalPositions: number;
  duplicateTrades: number;
  newTrades: number;
  updatedPositions: number;
  newPositions: number;
  savedTrades: number;
  skippedTrades: number;
  savedPositions: number;
  skippedPositions: number;
}

export interface ImportResult {
  trades: Trade[];
  positions: Position[];
  errors: string[];
  stats?: ImportStats;
}