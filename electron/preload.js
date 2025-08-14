const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    query: (sql, params) => 
      ipcRenderer.invoke('db:query', sql, params),
    execute: (sql, params) =>
      ipcRenderer.invoke('db:execute', sql, params),
    backup: () =>
      ipcRenderer.invoke('db:backup'),
    restore: () =>
      ipcRenderer.invoke('db:restore'),
  },
  csv: {
    import: (data) => 
      ipcRenderer.invoke('csv:import', data),
  },
  dialog: {
    openFile: (options) =>
      ipcRenderer.invoke('dialog:openFile', options),
  },
  account: {
    create: (account) =>
      ipcRenderer.invoke('accounts:create', account),
    getAll: () =>
      ipcRenderer.invoke('accounts:getAll'),
    getById: (id) =>
      ipcRenderer.invoke('accounts:getById', id),
    delete: (id) =>
      ipcRenderer.invoke('accounts:delete', id),
  },
  trades: {
    create: (trade) =>
      ipcRenderer.invoke('trades:create', trade),
    getByAccount: (accountId) =>
      ipcRenderer.invoke('trades:getByAccount', accountId),
  },
  positions: {
    getByAccount: (accountId, status) =>
      ipcRenderer.invoke('positions:getByAccount', accountId, status),
    getById: (positionId) =>
      ipcRenderer.invoke('positions:getById', positionId),
    update: (positionId, updates) =>
      ipcRenderer.invoke('positions:update', positionId, updates),
    updateInitialR: (positionId, initialR) =>
      ipcRenderer.invoke('positions:updateInitialR', positionId, initialR),
  },
  stopLoss: {
    update: (positionId, stopLosses, setAsInitialR) =>
      ipcRenderer.invoke('stopLoss:update', positionId, stopLosses, setAsInitialR),
  },
  settings: {
    get: (key) =>
      ipcRenderer.invoke('settings:get', key),
    set: (key, value) =>
      ipcRenderer.invoke('settings:set', key, value),
    getAll: () =>
      ipcRenderer.invoke('settings:getAll'),
  },
  equityCurve: {
    getLatest: (accountId) =>
      ipcRenderer.invoke('equityCurve:getLatest', accountId),
    getByAccount: (accountId) =>
      ipcRenderer.invoke('equityCurve:getByAccount', accountId),
    debugWeekendData: (accountId) =>
      ipcRenderer.invoke('equityCurve:debugWeekendData', accountId),
  },
  benchmark: {
    fetch: (symbols, startDate, endDate) =>
      ipcRenderer.invoke('benchmark:fetch', symbols, startDate, endDate),
  },
  fetchPriceData: (symbol, days, interval) =>
    ipcRenderer.invoke('fetch-price-data', symbol, days, interval),
  dailyPlan: {
    get: (accountId, planDate) =>
      ipcRenderer.invoke('daily-plan:get', accountId, planDate),
    save: (plan) =>
      ipcRenderer.invoke('daily-plan:save', plan),
    listByMonth: (accountId, year, month) =>
      ipcRenderer.invoke('daily-plan:list-by-month', accountId, year, month),
    delete: (accountId, planDate) =>
      ipcRenderer.invoke('daily-plan:delete', accountId, planDate),
    saveResult: (result) =>
      ipcRenderer.invoke('daily-plan:save-result', result),
  },
  auth: {
    loginDiscord: () =>
      ipcRenderer.invoke('auth:discord-login'),
    checkToken: () =>
      ipcRenderer.invoke('auth:check-token'),
    logout: () =>
      ipcRenderer.invoke('auth:logout'),
  },
});