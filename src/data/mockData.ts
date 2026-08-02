import { MarketPair, BotInstance, Candle, Position, Order, TradeHistory, ExchangeConfig, RiskLimits } from '../types';

export const INITIAL_MARKET_PAIRS: MarketPair[] = [
  {
    id: 'btc-usdt',
    symbol: 'BTC/USDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    currentPrice: 64850.25,
    change24h: 3.42,
    high24h: 65400.00,
    low24h: 62700.50,
    volume24h: 1845920300,
    precision: 2,
  },
  {
    id: 'eth-usdt',
    symbol: 'ETH/USDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    currentPrice: 3480.10,
    change24h: -1.15,
    high24h: 3560.00,
    low24h: 3410.20,
    volume24h: 942100400,
    precision: 2,
  },
  {
    id: 'sol-usdt',
    symbol: 'SOL/USDT',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    currentPrice: 178.45,
    change24h: 8.65,
    high24h: 182.30,
    low24h: 161.20,
    volume24h: 610480200,
    precision: 2,
  },
  {
    id: 'nvda-usdt',
    symbol: 'NVDA/USDT',
    baseAsset: 'NVDA',
    quoteAsset: 'USDT',
    currentPrice: 124.60,
    change24h: 2.15,
    high24h: 126.50,
    low24h: 121.80,
    volume24h: 420100900,
    precision: 2,
  },
  {
    id: 'aapl-usdt',
    symbol: 'AAPL/USDT',
    baseAsset: 'AAPL',
    quoteAsset: 'USDT',
    currentPrice: 228.30,
    change24h: -0.45,
    high24h: 230.10,
    low24h: 226.90,
    volume24h: 310500100,
    precision: 2,
  },
];

export const generateMockCandles = (basePrice: number, count: number = 50): Candle[] => {
  const candles: Candle[] = [];
  let current = basePrice * 0.92;
  const now = Date.now();
  const stepMs = 3600 * 1000; // 1 hour candles

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * stepMs;
    const dateStr = new Date(timestamp).toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const volatility = current * 0.015;
    const change = (Math.random() - 0.48) * volatility;
    const open = current;
    const close = Math.max(1, open + change);
    const high = Math.max(open, close) + Math.random() * volatility * 0.6;
    const low = Math.min(open, close) - Math.random() * volatility * 0.6;
    const volume = Math.floor(Math.random() * 5000 + 1000);

    current = close;

    candles.push({
      time: dateStr,
      timestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });
  }

  // Calculate technical indicators (SMA and RSI)
  for (let i = 0; i < candles.length; i++) {
    // 20 MA
    if (i >= 19) {
      const slice = candles.slice(i - 19, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      candles[i].ma20 = Number((sum / 20).toFixed(2));
    }
    // 50 MA
    if (i >= 49) {
      const slice = candles.slice(i - 49, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      candles[i].ma50 = Number((sum / 50).toFixed(2));
    }
    // Simple RSI approximation
    if (i >= 14) {
      let gains = 0;
      let losses = 0;
      for (let j = i - 13; j <= i; j++) {
        const diff = candles[j].close - candles[j - 1].close;
        if (diff >= 0) gains += diff;
        else losses += Math.abs(diff);
      }
      const avgGain = gains / 14;
      const avgLoss = losses / 14;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      candles[i].rsi = Number((100 - 100 / (1 + rs)).toFixed(1));
    } else {
      candles[i].rsi = 50;
    }
  }

  return candles;
};

export const INITIAL_BOTS: BotInstance[] = [
  {
    id: 'bot-1',
    name: 'BTC Grid Scalper 2.0',
    pairId: 'btc-usdt',
    symbol: 'BTC/USDT',
    strategy: 'GRID',
    status: 'RUNNING',
    allocatedCapital: 5000,
    currentEquity: 5420.50,
    totalPnL: 420.50,
    totalPnLPct: 8.41,
    totalTrades: 34,
    winningTrades: 28,
    createdAt: '2026-07-28 10:30',
    lastActive: 'Just now',
    config: {
      investmentAmount: 5000,
      leverage: 3,
      lowerPrice: 60000,
      upperPrice: 68000,
      gridLevels: 10,
      stopLossPct: 5,
      takeProfitPct: 15,
    },
    logs: [
      { id: 'l1', timestamp: '10:14:02', level: 'SUCCESS', message: 'Executed GRID BUY limit order @ $64,200 (0.05 BTC)' },
      { id: 'l2', timestamp: '09:45:11', level: 'INFO', message: 'Placed 5 ask grid orders between $65,000 and $68,000' },
      { id: 'l3', timestamp: '08:12:00', level: 'SUCCESS', message: 'Executed GRID SELL order @ $64,900 (+ $42.50 profit)' },
    ],
  },
  {
    id: 'bot-2',
    name: 'SOL Momentum RSI Bot',
    pairId: 'sol-usdt',
    symbol: 'SOL/USDT',
    strategy: 'RSI_MOMENTUM',
    status: 'RUNNING',
    allocatedCapital: 2500,
    currentEquity: 2890.10,
    totalPnL: 390.10,
    totalPnLPct: 15.60,
    totalTrades: 19,
    winningTrades: 15,
    createdAt: '2026-07-29 14:15',
    lastActive: '1 min ago',
    config: {
      investmentAmount: 2500,
      leverage: 5,
      rsiOversold: 30,
      rsiOverbought: 70,
      stopLossPct: 4,
      takeProfitPct: 12,
    },
    logs: [
      { id: 'l4', timestamp: '10:05:33', level: 'SUCCESS', message: 'RSI crossed below 30 (28.4). Long position opened @ $172.50' },
      { id: 'l5', timestamp: '07:20:10', level: 'INFO', message: 'Monitoring RSI on 15m timeframe' },
    ],
  },
  {
    id: 'bot-3',
    name: 'ETH DCA Accumulator',
    pairId: 'eth-usdt',
    symbol: 'ETH/USDT',
    strategy: 'DCA',
    status: 'PAUSED',
    allocatedCapital: 3000,
    currentEquity: 2980.00,
    totalPnL: -20.00,
    totalPnLPct: -0.67,
    totalTrades: 8,
    winningTrades: 5,
    createdAt: '2026-07-25 09:00',
    lastActive: '3 hours ago',
    config: {
      investmentAmount: 3000,
      leverage: 1,
      dcaAmount: 250,
      dcaIntervalHours: 24,
      stepDownPct: 2,
      stopLossPct: 10,
      takeProfitPct: 20,
    },
    logs: [
      { id: 'l6', timestamp: '07:00:00', level: 'WARNING', message: 'Bot paused by user' },
      { id: 'l7', timestamp: 'Yesterday', level: 'SUCCESS', message: 'Executed recurring DCA order $250 @ $3,450' },
    ],
  },
  {
    id: 'bot-4',
    name: 'AI Adaptive Trend Bot',
    pairId: 'nvda-usdt',
    symbol: 'NVDA/USDT',
    strategy: 'AI_ADAPTIVE',
    status: 'RUNNING',
    allocatedCapital: 4000,
    currentEquity: 4310.80,
    totalPnL: 310.80,
    totalPnLPct: 7.77,
    totalTrades: 12,
    winningTrades: 10,
    createdAt: '2026-07-30 11:20',
    lastActive: 'Just now',
    config: {
      investmentAmount: 4000,
      leverage: 2,
      stopLossPct: 3,
      takeProfitPct: 9,
      trailingStopPct: 2,
    },
    logs: [
      { id: 'l8', timestamp: '10:15:00', level: 'INFO', message: 'AI Engine re-evaluated market regime: Bullish Momentum confirmed' },
      { id: 'l9', timestamp: '09:00:22', level: 'SUCCESS', message: 'Adjusted trailing stop loss to $122.40 (+1.8% locked)' },
    ],
  },
];

export const INITIAL_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    botId: 'bot-1',
    symbol: 'BTC/USDT',
    side: 'LONG',
    entryPrice: 63900.00,
    currentPrice: 64850.25,
    size: 0.15,
    leverage: 3,
    margin: 3195.00,
    unrealizedPnL: 142.53,
    unrealizedPnLPct: 4.46,
    liquidationPrice: 42600.00,
    tpPrice: 68000.00,
    slPrice: 60705.00,
    openedAt: '2026-07-31 08:20',
  },
  {
    id: 'pos-2',
    botId: 'bot-2',
    symbol: 'SOL/USDT',
    side: 'LONG',
    entryPrice: 172.50,
    currentPrice: 178.45,
    size: 40,
    leverage: 5,
    margin: 1380.00,
    unrealizedPnL: 238.00,
    unrealizedPnLPct: 17.24,
    liquidationPrice: 138.00,
    tpPrice: 193.20,
    slPrice: 165.60,
    openedAt: '2026-07-31 09:12',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    botId: 'bot-1',
    symbol: 'BTC/USDT',
    side: 'BUY',
    type: 'LIMIT',
    price: 64000.00,
    amount: 0.05,
    filled: 0,
    status: 'OPEN',
    createdAt: '10:14:00',
  },
  {
    id: 'ord-102',
    botId: 'bot-1',
    symbol: 'BTC/USDT',
    side: 'SELL',
    type: 'LIMIT',
    price: 65800.00,
    amount: 0.05,
    filled: 0,
    status: 'OPEN',
    createdAt: '09:50:00',
  },
  {
    id: 'ord-103',
    botId: 'bot-4',
    symbol: 'NVDA/USDT',
    side: 'SELL',
    type: 'STOP_LIMIT',
    price: 122.40,
    amount: 25,
    filled: 0,
    status: 'OPEN',
    createdAt: '09:00:00',
  },
];

export const INITIAL_TRADE_HISTORY: TradeHistory[] = [
  {
    id: 'th-1',
    botId: 'bot-1',
    botName: 'BTC Grid Scalper 2.0',
    symbol: 'BTC/USDT',
    side: 'SELL',
    price: 64900.00,
    amount: 0.05,
    total: 3245.00,
    fee: 1.62,
    realizedPnL: 42.50,
    timestamp: '2026-07-31 08:12',
  },
  {
    id: 'th-2',
    botId: 'bot-2',
    botName: 'SOL Momentum RSI Bot',
    symbol: 'SOL/USDT',
    side: 'SELL',
    price: 176.20,
    amount: 20,
    total: 3524.00,
    fee: 1.76,
    realizedPnL: 84.00,
    timestamp: '2026-07-31 07:45',
  },
  {
    id: 'th-3',
    botId: 'bot-4',
    botName: 'AI Adaptive Trend Bot',
    symbol: 'NVDA/USDT',
    side: 'BUY',
    price: 121.80,
    amount: 30,
    total: 3654.00,
    fee: 1.82,
    realizedPnL: 0.00,
    timestamp: '2026-07-30 16:30',
  },
];

export const INITIAL_EXCHANGES: ExchangeConfig[] = [
  {
    id: 'exc-binance',
    name: 'Binance',
    icon: '⚡',
    status: 'CONNECTED',
    apiKey: 'bn_live_9a823f...4a10',
    apiSecret: '••••••••••••••••••••',
    isTestnet: true,
    balanceUSDT: 14890.50,
  },
  {
    id: 'exc-bybit',
    name: 'Bybit',
    icon: '🚀',
    status: 'CONNECTED',
    apiKey: 'by_test_881a...00f9',
    apiSecret: '••••••••••••••••••••',
    isTestnet: true,
    balanceUSDT: 8520.00,
  },
  {
    id: 'exc-coinbase',
    name: 'Coinbase Advanced',
    icon: '🛡️',
    status: 'SANDBOX',
    apiKey: 'cb_snd_7102...11ac',
    apiSecret: '••••••••••••••••••••',
    isTestnet: true,
    balanceUSDT: 5000.00,
  },
  {
    id: 'exc-alpaca',
    name: 'Alpaca Securities',
    icon: '📈',
    status: 'DISCONNECTED',
    apiKey: '',
    apiSecret: '',
    isTestnet: true,
    balanceUSDT: 0.00,
  },
];

export const DEFAULT_RISK_LIMITS: RiskLimits = {
  maxTotalDrawdownPct: 15,
  maxOpenPositions: 5,
  maxLeverageAllowed: 10,
  emergencyStopAllOnLossPct: 20,
  dailyLossLimitUSDT: 1000,
  enableTrailingStopGlobal: true,
};
