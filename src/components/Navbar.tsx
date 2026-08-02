import React from 'react';
import { Bot, Zap, AlertTriangle, ShieldCheck, Play, Pause, DollarSign, Activity } from 'lucide-react';
import { BotInstance } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  bots: BotInstance[];
  onToggleAllBots: (running: boolean) => void;
  onOpenCreateBotModal: () => void;
  paperBalance: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bots,
  onToggleAllBots,
  onOpenCreateBotModal,
  paperBalance,
}) => {
  const runningBotsCount = bots.filter((b) => b.status === 'RUNNING').length;
  const totalPnL = bots.reduce((sum, b) => sum + b.totalPnL, 0);

  const tabs = [
    { id: 'overview', label: 'Market Overview', icon: Activity },
    { id: 'bots', label: 'Bot Manager', icon: Bot, badge: runningBotsCount },
    { id: 'backtest', label: 'Backtesting', icon: Zap },
    { id: 'positions', label: 'Positions & Orders', icon: DollarSign },
    { id: 'ai-advisor', label: 'AI Strategy Advisor', icon: ShieldCheck },
    { id: 'risk', label: 'Risk & Exchanges', icon: AlertTriangle },
  ];

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <Bot className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-mono">TRADE BOT</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold border border-cyan-500/30">2.0</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Engine • Node 22</span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-slate-950 text-cyan-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-3">
            {/* Balance Widget */}
            <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800/80">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Paper Balance</span>
              <span className="text-xs font-bold font-mono text-emerald-400">${paperBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Total PnL Badge */}
            <div className="hidden md:flex flex-col items-end px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800/80">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Bot Total PnL</span>
              <span className={`text-xs font-bold font-mono ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </span>
            </div>

            {/* Emergency Controls */}
            {runningBotsCount > 0 ? (
              <button
                onClick={() => onToggleAllBots(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
                title="Pause All Running Bots"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Pause All</span>
              </button>
            ) : (
              <button
                onClick={() => onToggleAllBots(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
                title="Resume All Paused Bots"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Resume All</span>
              </button>
            )}

            {/* Create New Bot Button */}
            <button
              onClick={onOpenCreateBotModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>New Bot</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-slate-800/60 overflow-x-auto gap-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
