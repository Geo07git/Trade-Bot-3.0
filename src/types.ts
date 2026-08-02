export type StrategyType = 'GRID' | 'DCA' | 'RSI_MOMENTUM' | 'MA_CROSSOVER' | 'AI_ADAPTIVE';

export type BotStatus = 'RUNNING' | 'PAUSED' | 'STOPPED' | 'ERROR';

export type OrderSide = 'BUY' | 'SELL';

export type OrderType = 'LIMIT' | 'MARKET' | 'STOP_LIMIT';

export type PositionSide = 'LONG' | 'SHORT';

export interface MarketPair {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  precision: number;
}

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi?: number;
  ma20?: number;
  ma50?: number;
}

export interface StrategyConfig {
  // Grid Bot specific
  lowerPrice?: number;
  upperPrice?: number;
  gridLevels?: number;
  
  // DCA Bot specific
  dcaAmount?: number;
  dcaIntervalHours?: number;
  stepDownPct?: number;
  
  // Indicator specific
  rsiOverbought?: number;
  rsiOversold?: number;
  shortMaPeriod?: number;
  longMaPeriod?: number;
  
  // Risk & General
  investmentAmount: number;
  leverage: number;
  stopLossPct: number;
  takeProfitPct: number;
  trailingStopPct?: number;
  maxDrawdownLimitPct?: number;
}

export interface BotInstance {
  id: string;
  name: string;
  pairId: string;
  symbol: string;
  strategy: StrategyType;
  status: BotStatus;
  config: StrategyConfig;
  allocatedCapital: number;
  currentEquity: number;
  totalPnL: number;
  totalPnLPct: number;
  totalTrades: number;
  winningTrades: number;
  createdAt: string;
  lastActive: string;
  logs: BotLog[];
}

export interface BotLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
  details?: string;
}

export interface Position {
  id: string;
  botId?: string;
  symbol: string;
  side: PositionSide;
  entryPrice: number;
  currentPrice: number;
  size: number;
  leverage: number;
  margin: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  liquidationPrice: number;
  tpPrice?: number;
  slPrice?: number;
  openedAt: string;
}

export interface Order {
  id: string;
  botId?: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  filled: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  createdAt: string;
}

export interface TradeHistory {
  id: string;
  botId?: string;
  botName?: string;
  symbol: string;
  side: OrderSide;
  price: number;
  amount: number;
  total: number;
  fee: number;
  realizedPnL: number;
  timestamp: string;
}

export interface BacktestResult {
  strategy: StrategyType;
  symbol: string;
  timeframe: string;
  initialBalance: number;
  finalBalance: number;
  netProfit: number;
  netProfitPct: number;
  winRatePct: number;
  profitFactor: number;
  totalTrades: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  equityCurve: { time: string; balance: number }[];
  tradesList: TradeHistory[];
}

export interface ExchangeConfig {
  id: string;
  name: string;
  icon: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SANDBOX';
  apiKey: string;
  apiSecret: string;
  isTestnet: boolean;
  balanceUSDT: number;
}

export interface RiskLimits {
  maxTotalDrawdownPct: number;
  maxOpenPositions: number;
  maxLeverageAllowed: number;
  emergencyStopAllOnLossPct: number;
  dailyLossLimitUSDT: number;
  enableTrailingStopGlobal: boolean;
}
