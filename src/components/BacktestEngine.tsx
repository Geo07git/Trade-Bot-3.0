import React, { useState, useEffect } from 'react';
import { MarketPair, Candle, StrategyType, BacktestResult } from '../types';
import { calculateBacktest } from '../utils/tradingEngine';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Play, Download, Zap, TrendingUp, ShieldCheck, BarChart3, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BacktestEngineProps {
  pairs: MarketPair[];
  candles: Candle[];
}

export const BacktestEngine: React.FC<BacktestEngineProps> = ({ pairs, candles }) => {
  const [selectedPairId, setSelectedPairId] = useState(pairs[0]?.id || 'btc-usdt');
  const [strategy, setStrategy] = useState<StrategyType>('GRID');
  const [initialBalance, setInitialBalance] = useState(10000);
  const [leverage, setLeverage] = useState(3);
  const [stopLossPct, setStopLossPct] = useState(5);
  const [takeProfitPct, setTakeProfitPct] = useState(15);

  const selectedPair = pairs.find((p) => p.id === selectedPairId) || pairs[0];

  const [result, setResult] = useState<BacktestResult | null>(null);

  const runBacktest = () => {
    const res = calculateBacktest(
      candles,
      strategy,
      {
        investmentAmount: initialBalance,
        leverage,
        stopLossPct,
        takeProfitPct,
        lowerPrice: selectedPair.currentPrice * 0.9,
        upperPrice: selectedPair.currentPrice * 1.1,
        gridLevels: 10,
        rsiOversold: 30,
        rsiOverbought: 70,
      },
      selectedPair.symbol
    );
    setResult(res);
  };

  useEffect(() => {
    runBacktest();
  }, [selectedPairId, strategy]);

  const handleExportCSV = () => {
    if (!result) return;
    const headers = 'ID,Symbol,Side,Price,Amount,Total,Fee,RealizedPnL,Timestamp\n';
    const rows = result.tradesList
      .map(
        (t) =>
          `${t.id},${t.symbol},${t.side},${t.price},${t.amount},${t.total},${t.fee},${t.realizedPnL},${t.timestamp}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest_${result.symbol}_${result.strategy}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Configuration Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Algorithmic Strategy Backtesting Engine
            </h2>
            <p className="text-xs text-slate-400">Simulate strategy performance against historical OHLCV data</p>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all border border-slate-700"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export Trades CSV</span>
              </button>
            )}
            <button
              onClick={runBacktest}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Backtest</span>
            </button>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Asset Pair</label>
            <select
              value={selectedPairId}
              onChange={(e) => setSelectedPairId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white"
            >
              {pairs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as StrategyType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white"
            >
              <option value="GRID">Grid Scalper</option>
              <option value="RSI_MOMENTUM">RSI Momentum</option>
              <option value="MA_CROSSOVER">MA Crossover</option>
              <option value="DCA">DCA Accumulator</option>
              <option value="AI_ADAPTIVE">AI Adaptive Trend</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Initial Balance ($)</label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Leverage ({leverage}x)</label>
            <input
              type="number"
              min="1"
              max="20"
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Stop Loss (%)</label>
            <input
              type="number"
              value={stopLossPct}
              onChange={(e) => setStopLossPct(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Take Profit (%)</label>
            <input
              type="number"
              value={takeProfitPct}
              onChange={(e) => setTakeProfitPct(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* Results Summary Cards */}
      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 font-mono block">Net Return</span>
              <span className={`text-base font-black font-mono ${result.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.netProfit >= 0 ? '+' : ''}${result.netProfit} ({result.netProfitPct}%)
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 font-mono block">Win Rate</span>
              <span className="text-base font-black font-mono text-cyan-400">{result.winRatePct}%</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 font-mono block">Profit Factor</span>
              <span className="text-base font-black font-mono text-amber-400">{result.profitFactor}</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 font-mono block">Max Drawdown</span>
              <span className="text-base font-black font-mono text-rose-400">-{result.maxDrawdownPct}%</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 font-mono block">Sharpe Ratio</span>
              <span className="text-base font-black font-mono text-purple-400">{result.sharpeRatio}</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 font-mono block">Total Trades</span>
              <span className="text-base font-black font-mono text-slate-200">{result.totalTrades}</span>
            </div>

          </div>

          {/* Equity Curve Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold font-mono text-sm text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Simulated Equity Curve Over Time
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.equityCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(val: any) => [`$${val}`, 'Equity Balance']}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Execution Trade Log */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold font-mono text-sm text-white mb-3">Simulated Executed Trades ({result.tradesList.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Total ($)</th>
                    <th className="pb-2">Fee ($)</th>
                    <th className="pb-2 text-right">Realized PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.tradesList.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-2 text-slate-400">{t.timestamp}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded font-bold ${t.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {t.side}
                        </span>
                      </td>
                      <td className="py-2 text-white">${t.price.toLocaleString()}</td>
                      <td className="py-2 text-slate-300">{t.amount}</td>
                      <td className="py-2 text-slate-300">${t.total}</td>
                      <td className="py-2 text-slate-500">${t.fee}</td>
                      <td className={`py-2 text-right font-bold ${t.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.realizedPnL !== 0 ? `${t.realizedPnL >= 0 ? '+' : ''}$${t.realizedPnL}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
