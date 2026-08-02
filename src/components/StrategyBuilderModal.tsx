import React, { useState } from 'react';
import { StrategyType, MarketPair, StrategyConfig, BotInstance } from '../types';
import { Zap, ShieldCheck, Grid, RefreshCw, Activity, Cpu, X, DollarSign } from 'lucide-react';

interface StrategyBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pairs: MarketPair[];
  onCreateBot: (bot: Omit<BotInstance, 'id' | 'createdAt' | 'lastActive' | 'logs'>) => void;
}

export const StrategyBuilderModal: React.FC<StrategyBuilderModalProps> = ({
  isOpen,
  onClose,
  pairs,
  onCreateBot,
}) => {
  const [name, setName] = useState('My Custom Bot 2.0');
  const [selectedPairId, setSelectedPairId] = useState(pairs[0]?.id || 'btc-usdt');
  const [strategy, setStrategy] = useState<StrategyType>('GRID');
  
  // Strategy params
  const [investmentAmount, setInvestmentAmount] = useState(2500);
  const [leverage, setLeverage] = useState(3);
  const [stopLossPct, setStopLossPct] = useState(5);
  const [takeProfitPct, setTakeProfitPct] = useState(15);
  const [trailingStopPct, setTrailingStopPct] = useState(2);

  // Strategy specific
  const selectedPair = pairs.find((p) => p.id === selectedPairId) || pairs[0];
  const currentPrice = selectedPair?.currentPrice || 64000;

  const [lowerPrice, setLowerPrice] = useState(Math.floor(currentPrice * 0.9));
  const [upperPrice, setUpperPrice] = useState(Math.floor(currentPrice * 1.1));
  const [gridLevels, setGridLevels] = useState(10);

  const [dcaAmount, setDcaAmount] = useState(200);
  const [dcaIntervalHours, setDcaIntervalHours] = useState(24);

  const [rsiOversold, setRsiOversold] = useState(30);
  const [rsiOverbought, setRsiOverbought] = useState(70);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: StrategyConfig = {
      investmentAmount,
      leverage,
      stopLossPct,
      takeProfitPct,
      trailingStopPct,
      lowerPrice: strategy === 'GRID' ? lowerPrice : undefined,
      upperPrice: strategy === 'GRID' ? upperPrice : undefined,
      gridLevels: strategy === 'GRID' ? gridLevels : undefined,
      dcaAmount: strategy === 'DCA' ? dcaAmount : undefined,
      dcaIntervalHours: strategy === 'DCA' ? dcaIntervalHours : undefined,
      rsiOversold: strategy === 'RSI_MOMENTUM' ? rsiOversold : undefined,
      rsiOverbought: strategy === 'RSI_MOMENTUM' ? rsiOverbought : undefined,
    };

    onCreateBot({
      name,
      pairId: selectedPair.id,
      symbol: selectedPair.symbol,
      strategy,
      status: 'RUNNING',
      allocatedCapital: investmentAmount,
      currentEquity: investmentAmount,
      totalPnL: 0,
      totalPnLPct: 0,
      totalTrades: 0,
      winningTrades: 0,
      config,
    });

    onClose();
  };

  const strategies: { id: StrategyType; title: string; desc: string; icon: any }[] = [
    { id: 'GRID', title: 'Grid Trading', desc: 'Automated buy-low sell-high ladder within price channel', icon: Grid },
    { id: 'DCA', title: 'DCA Accumulator', desc: 'Dollar Cost Averaging with recurring step down buys', icon: RefreshCw },
    { id: 'RSI_MOMENTUM', title: 'RSI Momentum', desc: 'Executes trades on oversold/overbought momentum crosses', icon: Activity },
    { id: 'MA_CROSSOVER', title: 'MA Crossover', desc: 'Buys on Golden Cross (20/50 MA) and exits on Death Cross', icon: Zap },
    { id: 'AI_ADAPTIVE', title: 'AI Adaptive', desc: 'Gemini-assisted regime switching and trailing volatility stops', icon: Cpu },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-mono text-base text-white">Deploy Automated Trading Bot 2.0</h3>
              <p className="text-xs text-slate-400">Configure strategy parameters and risk safeguards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Bot Name & Asset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bot Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Asset Pair</label>
              <select
                value={selectedPairId}
                onChange={(e) => setSelectedPairId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none"
              >
                {pairs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.symbol} (${p.currentPrice.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Strategy Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Algorithm Strategy</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {strategies.map((s) => {
                const Icon = s.icon;
                const isSel = strategy === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStrategy(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSel
                        ? 'bg-cyan-500/10 border-cyan-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSel ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="font-mono font-bold text-xs">{s.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">{s.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Strategy Inputs */}
          {strategy === 'GRID' && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="font-mono text-xs font-bold text-cyan-400">Grid Price Channel Boundaries</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Lower Price ($)</label>
                  <input
                    type="number"
                    value={lowerPrice}
                    onChange={(e) => setLowerPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Upper Price ($)</label>
                  <input
                    type="number"
                    value={upperPrice}
                    onChange={(e) => setUpperPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Grid Levels</label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={gridLevels}
                    onChange={(e) => setGridLevels(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Capital & Leverage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Allocated Investment ($)</label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Leverage ({leverage}x)</label>
              <input
                type="range"
                min="1"
                max="20"
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer mt-3"
              />
            </div>
          </div>

          {/* Risk Management Safeguards */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Automated Risk Safeguards
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Stop Loss (%)</label>
                <input
                  type="number"
                  value={stopLossPct}
                  onChange={(e) => setStopLossPct(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Take Profit (%)</label>
                <input
                  type="number"
                  value={takeProfitPct}
                  onChange={(e) => setTakeProfitPct(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Trailing Stop (%)</label>
                <input
                  type="number"
                  value={trailingStopPct}
                  onChange={(e) => setTrailingStopPct(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider font-mono shadow-lg shadow-cyan-500/20 transition-all"
          >
            Launch Trading Bot Now
          </button>

        </form>

      </div>
    </div>
  );
};
