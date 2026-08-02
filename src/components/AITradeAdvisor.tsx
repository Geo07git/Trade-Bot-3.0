import React, { useState } from 'react';
import { BotInstance, MarketPair } from '../types';
import { Cpu, Send, Bot, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

interface AITradeAdvisorProps {
  bots: BotInstance[];
  pairs: MarketPair[];
}

export const AITradeAdvisor: React.FC<AITradeAdvisorProps> = ({ bots, pairs }) => {
  const [selectedBotId, setSelectedBotId] = useState<string>(bots[0]?.id || '');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const selectedBot = bots.find((b) => b.id === selectedBotId) || bots[0];
  const pair = pairs.find((p) => p.symbol === selectedBot?.symbol) || pairs[0];

  const handleAnalyze = async (customQuery?: string) => {
    setLoading(true);
    setAnalysisResult(null);

    const userQuery = customQuery || query || 'Analyze current market structure, volatility, and risk settings for this bot.';

    try {
      const res = await fetch('/api/gemini/analyze-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedBot?.symbol || 'BTC/USDT',
          strategy: selectedBot?.strategy || 'GRID',
          currentPrice: pair?.currentPrice || 64850,
          config: selectedBot?.config,
          botLogs: selectedBot?.logs,
          userQuery,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
      } else {
        setAnalysisResult(`Error analyzing strategy: ${data.error}`);
      }
    } catch (err: any) {
      setAnalysisResult(`Network or server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const presetQueries = [
    'How should I adjust grid bounds given current volatility?',
    'Evaluate stop loss risk for 5x leverage on this pair',
    'Is RSI Momentum currently effective on 15m candles?',
    'Suggest optimal take profit and trailing stop targets',
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-mono text-white">Gemini AI Strategy Advisor</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  GEMINI 2.5 FLASH
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Quantitative market regime detection, parameter optimization, and automated risk diagnostics powered by Google Gemini AI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBotId}
              onChange={(e) => setSelectedBotId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white font-mono text-xs rounded-xl px-3 py-2.5"
            >
              {bots.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.symbol})
                </option>
              ))}
            </select>

            <button
              onClick={() => handleAnalyze()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-cyan-500/20 transition-all shrink-0"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Analyzing...' : 'Run Diagnostics'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-500 mr-1">Quick Prompts:</span>
        {presetQueries.map((pq, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(pq);
              handleAnalyze(pq);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-all"
          >
            "{pq}"
          </button>
        ))}
      </div>

      {/* Custom Inquiry Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ask Gemini about strategy tuning for ${selectedBot?.name || 'your bot'}...`}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={() => handleAnalyze()}
          disabled={loading || !query.trim()}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono shrink-0 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Analysis Output Container */}
      {analysisResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold font-mono text-sm text-white">AI Strategy Analysis & Diagnostic Report</h3>
          </div>

          <div className="prose prose-invert max-w-none text-xs font-mono leading-relaxed text-slate-300 space-y-3 whitespace-pre-wrap">
            {analysisResult}
          </div>
        </div>
      )}

    </div>
  );
};
