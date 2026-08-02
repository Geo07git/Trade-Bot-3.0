import React from 'react';
import { Position, Order, TradeHistory } from '../types';
import { DollarSign, Download, Trash2, ArrowUpRight, ArrowDownRight, Layers, CheckCircle } from 'lucide-react';

interface PositionsAndOrdersProps {
  positions: Position[];
  orders: Order[];
  tradeHistory: TradeHistory[];
  onClosePosition: (positionId: string) => void;
  onCancelOrder: (orderId: string) => void;
}

export const PositionsAndOrders: React.FC<PositionsAndOrdersProps> = ({
  positions,
  orders,
  tradeHistory,
  onClosePosition,
  onCancelOrder,
}) => {

  const handleExportHistoryCSV = () => {
    const headers = 'ID,BotName,Symbol,Side,Price,Amount,Total,Fee,RealizedPnL,Timestamp\n';
    const rows = tradeHistory
      .map(
        (t) =>
          `${t.id},"${t.botName || 'Manual'}",${t.symbol},${t.side},${t.price},${t.amount},${t.total},${t.fee},${t.realizedPnL},${t.timestamp}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade_history_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Active Leveraged Positions Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Active Leveraged Positions ({positions.length})
          </h2>
        </div>

        {positions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono text-xs">
            No active positions currently open.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2">Side / Lev</th>
                  <th className="pb-2">Entry Price</th>
                  <th className="pb-2">Mark Price</th>
                  <th className="pb-2">Margin ($)</th>
                  <th className="pb-2">Liq. Price</th>
                  <th className="pb-2">Unrealized PnL</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {positions.map((p) => {
                  const isPos = p.unrealizedPnL >= 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-white">{p.symbol}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${p.side === 'LONG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {p.side} {p.leverage}x
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">${p.entryPrice.toLocaleString()}</td>
                      <td className="py-3 text-slate-100 font-bold">${p.currentPrice.toLocaleString()}</td>
                      <td className="py-3 text-slate-400">${p.margin.toFixed(2)}</td>
                      <td className="py-3 text-amber-400/80">${p.liquidationPrice.toLocaleString()}</td>
                      <td className={`py-3 font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? '+' : ''}${p.unrealizedPnL.toFixed(2)} ({isPos ? '+' : ''}{p.unrealizedPnLPct.toFixed(2)}%)
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onClosePosition(p.id)}
                          className="px-3 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[11px] border border-rose-500/30 transition-all"
                        >
                          Close Position
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Open Limit Orders */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Pending Open Orders ({orders.length})
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono text-xs">
            No pending limit or stop orders.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Side</th>
                  <th className="pb-2">Trigger Price</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 text-slate-500">{o.createdAt}</td>
                    <td className="py-2.5 font-bold text-white">{o.symbol}</td>
                    <td className="py-2.5 text-slate-400">{o.type}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded font-bold ${o.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {o.side}
                      </span>
                    </td>
                    <td className="py-2.5 text-white">${o.price.toLocaleString()}</td>
                    <td className="py-2.5 text-slate-300">{o.amount}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onCancelOrder(o.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px]"
                      >
                        Cancel Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Trade Execution Ledger */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-400" />
            Trade History Log
          </h2>
          <button
            onClick={handleExportHistoryCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Bot Origin</th>
                <th className="pb-2">Symbol</th>
                <th className="pb-2">Side</th>
                <th className="pb-2">Execution Price</th>
                <th className="pb-2">Volume</th>
                <th className="pb-2">Total ($)</th>
                <th className="pb-2 text-right">Realized PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tradeHistory.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 text-slate-500">{t.timestamp}</td>
                  <td className="py-2.5 text-slate-300">{t.botName || 'Manual Paper Trade'}</td>
                  <td className="py-2.5 font-bold text-white">{t.symbol}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded font-bold ${t.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {t.side}
                    </span>
                  </td>
                  <td className="py-2.5 text-white">${t.price.toLocaleString()}</td>
                  <td className="py-2.5 text-slate-300">{t.amount}</td>
                  <td className="py-2.5 text-slate-300">${t.total.toLocaleString()}</td>
                  <td className={`py-2.5 text-right font-bold ${t.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.realizedPnL !== 0 ? `${t.realizedPnL >= 0 ? '+' : ''}$${t.realizedPnL.toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
