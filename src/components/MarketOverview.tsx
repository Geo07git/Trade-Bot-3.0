import React, { useState, useEffect } from 'react';
import { MarketPair, Candle, OrderSide } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Zap, ArrowUpRight, ArrowDownRight, Activity, DollarSign, Layers } from 'lucide-react';

interface MarketOverviewProps {
  pairs: MarketPair[];
  selectedPair: MarketPair;
  onSelectPair: (pair: MarketPair) => void;
  candles: Candle[];
  onExecutePaperOrder: (pair: MarketPair, side: OrderSide, amount: number, price: number, leverage: number) => void;
  paperBalance: number;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  pairs,
  selectedPair,
  onSelectPair,
  candles,
  onExecutePaperOrder,
  paperBalance,
}) => {
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderAmount, setOrderAmount] = useState<number>(0.1);
  const [leverage, setLeverage] = useState<number>(3);
  const [showIndicators, setShowIndicators] = useState<{ ma20: boolean; ma50: boolean; rsi: boolean }>({
    ma20: true,
    ma50: true,
    rsi: false,
  });

  const [orderBook, setOrderBook] = useState<{ asks: { price: number; amount: number }[]; bids: { price: number; amount: number }[] }>({
    asks: [],
    bids: [],
  });

  // Generate realistic orderbook surrounding current price
  useEffect(() => {
    const cp = selectedPair.currentPrice;
    const asks = [];
    const bids = [];

    for (let i = 1; i <= 6; i++) {
      const askPrice = cp + (i * cp * 0.001);
      const bidPrice = cp - (i * cp * 0.001);
      asks.push({ price: askPrice, amount: Math.random() * 1.5 + 0.1 });
      bids.push({ price: bidPrice, amount: Math.random() * 1.5 + 0.1 });
    }

    setOrderBook({ asks: asks.reverse(), bids });
  }, [selectedPair.currentPrice]);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderAmount <= 0) return;
    onExecutePaperOrder(selectedPair, orderSide, orderAmount, selectedPair.currentPrice, leverage);
  };

  const isPositive = selectedPair.change24h >= 0;

  return (
    <div className="space-y-6">
      
      {/* Ticker Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {pairs.map((p) => {
          const active = p.id === selectedPair.id;
          const pos = p.change24h >= 0;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPair(p)}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                active
                  ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-sm text-white">{p.symbol}</span>
                <span className={`text-xs font-bold font-mono flex items-center ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {pos ? '+' : ''}{p.change24h}%
                </span>
              </div>
              <div className="font-mono font-bold text-base text-slate-100">
                ${p.currentPrice.toLocaleString('en-US', { minimumFractionDigits: p.precision })}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Vol: ${(p.volume24h / 1e6).toFixed(1)}M
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chart + Orderbook + Order execution grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Columns: Main Interactive Chart */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold font-mono text-white">{selectedPair.symbol}</h2>
                <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {isPositive ? '+' : ''}{selectedPair.change24h}% 24h
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-1">
                <span>High: <strong className="text-slate-200">${selectedPair.high24h}</strong></span>
                <span>Low: <strong className="text-slate-200">${selectedPair.low24h}</strong></span>
                <span>24h Vol: <strong className="text-slate-200">${(selectedPair.volume24h / 1e6).toFixed(1)}M</strong></span>
              </div>
            </div>

            {/* Indicator Toggles */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">Overlays:</span>
              <button
                onClick={() => setShowIndicators((prev) => ({ ...prev, ma20: !prev.ma20 }))}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
                  showIndicators.ma20 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-800/60 text-slate-500 border-slate-700'
                }`}
              >
                MA 20
              </button>
              <button
                onClick={() => setShowIndicators((prev) => ({ ...prev, ma50: !prev.ma50 }))}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
                  showIndicators.ma50 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-800/60 text-slate-500 border-slate-700'
                }`}
              >
                MA 50
              </button>
              <button
                onClick={() => setShowIndicators((prev) => ({ ...prev, rsi: !prev.rsi }))}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
                  showIndicators.rsi ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'bg-slate-800/60 text-slate-500 border-slate-700'
                }`}
              >
                RSI
              </button>
            </div>
          </div>

          {/* Area Price Chart */}
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={candles} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}
                  formatter={(val: any) => [`$${val}`, 'Price']}
                />
                <Area type="monotone" dataKey="close" stroke={isPositive ? '#10b981' : '#f43f5e'} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Indicator Info Strip */}
          <div className="flex items-center justify-between text-xs font-mono pt-3 mt-2 border-t border-slate-800 text-slate-400">
            <div className="flex items-center gap-4">
              <span>RSI (14): <strong className="text-purple-400">{candles[candles.length - 1]?.rsi || 52}</strong></span>
              <span>MA 20: <strong className="text-cyan-400">${candles[candles.length - 1]?.ma20 || selectedPair.currentPrice}</strong></span>
              <span>MA 50: <strong className="text-amber-400">${candles[candles.length - 1]?.ma50 || selectedPair.currentPrice}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Realtime Feed Active</span>
            </div>
          </div>

        </div>

        {/* Right 4 Columns: Order Book + Quick Paper Trade */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Paper Trade Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="font-bold font-mono text-sm text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Quick Paper Trade
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Bal: ${paperBalance.toFixed(0)}</span>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              
              {/* Buy / Sell Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setOrderSide('BUY')}
                  className={`py-2 rounded-lg font-bold text-xs transition-all ${
                    orderSide === 'BUY'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('SELL')}
                  className={`py-2 rounded-lg font-bold text-xs transition-all ${
                    orderSide === 'SELL'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              {/* Amount & Leverage Inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount ({selectedPair.baseAsset})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-500">{selectedPair.baseAsset}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">Leverage ({leverage}x)</label>
                  <span className="text-[10px] font-mono text-cyan-400">Max 50x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Order Margin Summary */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Execution Price:</span>
                  <span>${selectedPair.currentPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Required Margin:</span>
                  <span className="text-cyan-400">${((orderAmount * selectedPair.currentPrice) / leverage).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider font-mono transition-all shadow-lg ${
                  orderSide === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                }`}
              >
                Execute {orderSide} Market Order
              </button>

            </form>
          </div>

          {/* Live Orderbook Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="font-bold font-mono text-xs text-slate-300 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Order Book Depth
            </h3>

            {/* Asks (Sells) */}
            <div className="space-y-1 font-mono text-[11px] mb-2">
              {orderBook.asks.map((ask, idx) => (
                <div key={idx} className="flex justify-between items-center text-rose-400 relative py-0.5 px-1 rounded hover:bg-rose-500/10">
                  <span>${ask.price.toFixed(selectedPair.precision)}</span>
                  <span className="text-slate-400">{ask.amount.toFixed(3)}</span>
                </div>
              ))}
            </div>

            {/* Current Spread Price */}
            <div className="py-1.5 px-2 bg-slate-950 rounded text-center font-mono font-bold text-sm text-cyan-400 border border-slate-800 my-1">
              ${selectedPair.currentPrice.toLocaleString('en-US', { minimumFractionDigits: selectedPair.precision })}
            </div>

            {/* Bids (Buys) */}
            <div className="space-y-1 font-mono text-[11px] mt-2">
              {orderBook.bids.map((bid, idx) => (
                <div key={idx} className="flex justify-between items-center text-emerald-400 relative py-0.5 px-1 rounded hover:bg-emerald-500/10">
                  <span>${bid.price.toFixed(selectedPair.precision)}</span>
                  <span className="text-slate-400">{bid.amount.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
