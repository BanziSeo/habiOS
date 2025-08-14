import { registerDatabaseHandlers } from './database-handlers.js';
import { registerAccountHandlers } from './account-handlers.js';
import { registerTradingHandlers } from './trading-handlers.js';
import { registerSettingsHandlers } from './settings-handlers.js';
import { registerImportHandlers } from './import-handlers.js';
import { registerUtilityHandlers } from './utility-handlers.js';
import { registerDailyPlanHandlers } from './daily-plan-handlers.js';

export function registerAllHandlers() {
  registerDatabaseHandlers();
  registerAccountHandlers();
  registerTradingHandlers();
  registerSettingsHandlers();
  registerImportHandlers();
  registerUtilityHandlers();
  registerDailyPlanHandlers();
}