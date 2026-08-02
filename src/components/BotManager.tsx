import React, { useState } from 'react';
import { BotInstance, BotStatus } from '../types';
import { Play, Pause, Trash2, Terminal, Plus, ArrowUpRight, ArrowDownRight, Activity, Zap, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BotManagerProps {
  bots: BotInstance[];
  onToggleBotStatus: (botId: string) => void;
  onDeleteBot: (botId: string) => void;
  onOpenCreateModal: () => void;
}

export const BotManager: React.FC<BotManagerProps> = ({
  bots,
  onToggleBotStatus,
  onDeleteBot,
  onOpenCreateModal,
}) => {
  const [selectedLogBot, setSelectedLogBot] = useState<BotInstance | null>(null);

  const getStatusBadge = (status: BotStatus) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            RUNNING
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            PAUSED
          </span>
        );
      case 'STOPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            STOPPED
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            ERROR
          </span>
        );
    }
  };

  const totalCapital = bots.reduce((acc, b) => acc + b.allocatedCapital, 0);
  const totalPnL = bots.reduce((acc, b) => acc + b.totalPnL, 0);
  const runningCount = bots.filter((b) => b.status === 'RUNNING').length;

  return (
    <div className="space-y-6">
      
      {/* Top Metric Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-xs text-slate-400 font-semibold mb-1">Active Automated Bots</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black font-mono text-white">{runningCount} <span className="text-sm font-normal text-slate-500">/ {bots.length}</span></span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-xs text-slate-400 font-semibold mb-1">Total Capital Allocated</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black font-mono text-white">${totalCapital.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-xs text-slate-400 font-semibold mb-1">Net Realized PnL</div>
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-black font-mono ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </span>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${totalPnL >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              {totalPnL >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-center">
          <button
            onClick={onOpenCreateModal}
            className="w-full h-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>Deploy New Bot</span>
          </button>
        </div>

      </div>

      {/* Bot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => {
          const isPos = bot.totalPnL >= 0;
          const winRate = bot.totalTrades > 0 ? ((bot.winningTrades / bot.totalTrades) * 100).toFixed(0) : '0';

          return (
            <div
              key={bot.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-white">{bot.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-cyan-400 font-semibold">{bot.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {bot.strategy}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(bot.status)}
                </div>

                {/* Capital & PnL Metrics */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80 my-4 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total PnL</span>
                    <span className={`text-base font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? '+' : ''}${bot.totalPnL.toFixed(2)} ({isPos ? '+' : ''}{bot.totalPnLPct}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Win Rate</span>
                    <span className="text-base font-bold text-slate-200">
                      {winRate}% <span className="text-xs text-slate-500 font-normal">({bot.winningTrades}/{bot.totalTrades})</span>
                    </span>
                  </div>
                </div>

                {/* Config summary */}
                <div className="space-y-1 text-xs text-slate-400 font-mono mb-4">
                  <div className="flex justify-between">
                    <span>Allocated:</span>
                    <span className="text-slate-200">${bot.allocatedCapital} ({bot.config.leverage}x Lev)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stop Loss / TP:</span>
                    <span className="text-slate-200">-{bot.config.stopLossPct}% / +{bot.config.takeProfitPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Activity:</span>
                    <span className="text-slate-400">{bot.lastActive}</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                
                <button
                  onClick={() => setSelectedLogBot(bot)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Logs ({bot.logs.length})</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleBotStatus(bot.id)}
                    className={`p-2 rounded-lg font-bold transition-all ${
                      bot.status === 'RUNNING'
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    }`}
                    title={bot.status === 'RUNNING' ? 'Pause Bot' : 'Start Bot'}
                  >
                    {bot.status === 'RUNNING' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={() => onDeleteBot(bot.id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                    title="Delete Bot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Bot Logs Terminal Modal */}
      {selectedLogBot && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="font-mono font-bold text-sm text-white">{selectedLogBot.name} — Execution Logs</h3>
              </div>
              <button
                onClick={() => setSelectedLogBot(null)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto font-mono text-xs space-y-2 bg-slate-950/90">
              {selectedLogBot.logs.map((l) => (
                <div key={l.id} className="flex items-start gap-3 p-2 rounded bg-slate-900/50 border border-slate-800/60">
                  <span className="text-slate-500 shrink-0">[{l.timestamp}]</span>
                  <span
                    className={`font-bold shrink-0 ${
                      l.level === 'SUCCESS'
                        ? 'text-emerald-400'
                        : l.level === 'WARNING'
                        ? 'text-amber-400'
                        : l.level === 'ERROR'
                        ? 'text-rose-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    [{l.level}]
                  </span>
                  <span className="text-slate-200">{l.message}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
