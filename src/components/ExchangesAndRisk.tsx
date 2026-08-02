import React, { useState } from 'react';
import { ExchangeConfig, RiskLimits } from '../types';
import { ShieldCheck, Key, Lock, AlertTriangle, CheckCircle, RefreshCw, Layers } from 'lucide-react';

interface ExchangesAndRiskProps {
  exchanges: ExchangeConfig[];
  onUpdateExchange: (id: string, apiKey: string, apiSecret: string) => void;
  riskLimits: RiskLimits;
  onUpdateRiskLimits: (limits: RiskLimits) => void;
}

export const ExchangesAndRisk: React.FC<ExchangesAndRiskProps> = ({
  exchanges,
  onUpdateExchange,
  riskLimits,
  onUpdateRiskLimits,
}) => {
  const [limits, setLimits] = useState<RiskLimits>(riskLimits);
  const [editingExchangeId, setEditingExchangeId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiSecretInput, setApiSecretInput] = useState('');

  const handleSaveRisk = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRiskLimits(limits);
  };

  const handleSaveExchange = (id: string) => {
    onUpdateExchange(id, apiKeyInput, apiSecretInput);
    setEditingExchangeId(null);
    setApiKeyInput('');
    setApiSecretInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Risk Limits Manager */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-white">Global Circuit Breaker & Risk Governance</h2>
            <p className="text-xs text-slate-400">System-wide limits enforced across all active trading bots</p>
          </div>
        </div>

        <form onSubmit={handleSaveRisk} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Max Total Drawdown Limit (%)</label>
            <input
              type="number"
              value={limits.maxTotalDrawdownPct}
              onChange={(e) => setLimits({ ...limits, maxTotalDrawdownPct: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Stop Loss Limit ($)</label>
            <input
              type="number"
              value={limits.dailyLossLimitUSDT}
              onChange={(e) => setLimits({ ...limits, dailyLossLimitUSDT: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Max Concurrent Positions</label>
            <input
              type="number"
              value={limits.maxOpenPositions}
              onChange={(e) => setLimits({ ...limits, maxOpenPositions: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Max Allowed Leverage (x)</label>
            <input
              type="number"
              value={limits.maxLeverageAllowed}
              onChange={(e) => setLimits({ ...limits, maxLeverageAllowed: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Panic Stop (%)</label>
            <input
              type="number"
              value={limits.emergencyStopAllOnLossPct}
              onChange={(e) => setLimits({ ...limits, emergencyStopAllOnLossPct: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs font-mono transition-all shadow-lg shadow-rose-500/20"
            >
              Update Risk Safeguards
            </button>
          </div>

        </form>
      </div>

      {/* Exchange API Integration Sandbox */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-white">Exchange API Key Sandbox Integrations</h2>
            <p className="text-xs text-slate-400">Configure read/trade permissions for live or testnet execution</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exchanges.map((exc) => {
            const isEditing = editingExchangeId === exc.id;

            return (
              <div key={exc.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{exc.icon}</span>
                    <span className="font-mono font-bold text-sm text-white">{exc.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      exc.status === 'CONNECTED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : exc.status === 'SANDBOX'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {exc.status}
                  </span>
                </div>

                {!isEditing ? (
                  <div className="space-y-2 font-mono text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>API Key:</span>
                      <span className="text-slate-200">{exc.apiKey || 'Not Configured'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Testnet USDT Balance:</span>
                      <span className="text-emerald-400 font-bold">${exc.balanceUSDT.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => {
                        setEditingExchangeId(exc.id);
                        setApiKeyInput(exc.apiKey);
                      }}
                      className="w-full mt-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800"
                    >
                      Configure API Credentials
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">API Key</label>
                      <input
                        type="text"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Enter API Key"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">API Secret</label>
                      <input
                        type="password"
                        value={apiSecretInput}
                        onChange={(e) => setApiSecretInput(e.target.value)}
                        placeholder="Enter API Secret"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveExchange(exc.id)}
                        className="flex-1 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono"
                      >
                        Save & Test Connection
                      </button>
                      <button
                        onClick={() => setEditingExchangeId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 text-xs font-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
