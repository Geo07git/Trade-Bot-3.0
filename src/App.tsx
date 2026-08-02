import React, { useState, useEffect } from 'react';
import {
  MarketPair,
  BotInstance,
  Candle,
  Position,
  Order,
  TradeHistory,
  ExchangeConfig,
  RiskLimits,
  OrderSide,
} from './types';
import {
  INITIAL_MARKET_PAIRS,
  INITIAL_BOTS,
  INITIAL_POSITIONS,
  INITIAL_ORDERS,
  INITIAL_TRADE_HISTORY,
  INITIAL_EXCHANGES,
  DEFAULT_RISK_LIMITS,
  generateMockCandles,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { MarketOverview } from './components/MarketOverview';
import { BotManager } from './components/BotManager';
import { StrategyBuilderModal } from './components/StrategyBuilderModal';
import { BacktestEngine } from './components/BacktestEngine';
import { PositionsAndOrders } from './components/PositionsAndOrders';
import { AITradeAdvisor } from './components/AITradeAdvisor';
import { ExchangesAndRisk } from './components/ExchangesAndRisk';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [pairs, setPairs] = useState<MarketPair[]>(INITIAL_MARKET_PAIRS);
  const [selectedPair, setSelectedPair] = useState<MarketPair>(INITIAL_MARKET_PAIRS[0]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [bots, setBots] = useState<BotInstance[]>(INITIAL_BOTS);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>(INITIAL_TRADE_HISTORY);
  const [exchanges, setExchanges] = useState<ExchangeConfig[]>(INITIAL_EXCHANGES);
  const [riskLimits, setRiskLimits] = useState<RiskLimits>(DEFAULT_RISK_LIMITS);
  const [paperBalance, setPaperBalance] = useState<number>(25000.00);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Generate initial candles on selected pair change
  useEffect(() => {
    const generated = generateMockCandles(selectedPair.currentPrice, 60);
    setCandles(generated);
  }, [selectedPair.id]);

  // Live price ticker simulator effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPairs((prevPairs) => {
        return prevPairs.map((p) => {
          const delta = (Math.random() - 0.49) * (p.currentPrice * 0.002);
          const newPrice = Number((p.currentPrice + delta).toFixed(p.precision));
          return {
            ...p,
            currentPrice: newPrice,
            high24h: Math.max(p.high24h, newPrice),
            low24h: Math.min(p.low24h, newPrice),
          };
        });
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Update selected pair reference when pair ticker updates
  useEffect(() => {
    const updated = pairs.find((p) => p.id === selectedPair.id);
    if (updated) setSelectedPair(updated);
  }, [pairs]);

  // Handle Paper Order Execution
  const handleExecutePaperOrder = (
    pair: MarketPair,
    side: OrderSide,
    amount: number,
    price: number,
    leverage: number
  ) => {
    const totalVal = amount * price;
    const marginReq = totalVal / leverage;

    if (marginReq > paperBalance) {
      alert(`Insufficient paper balance! Required margin: $${marginReq.toFixed(2)}, Available: $${paperBalance.toFixed(2)}`);
      return;
    }

    setPaperBalance((prev) => prev - marginReq);

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      symbol: pair.symbol,
      side: side === 'BUY' ? 'LONG' : 'SHORT',
      entryPrice: price,
      currentPrice: price,
      size: amount,
      leverage,
      margin: Number(marginReq.toFixed(2)),
      unrealizedPnL: 0,
      unrealizedPnLPct: 0,
      liquidationPrice: Number((side === 'BUY' ? price * 0.8 : price * 1.2).toFixed(2)),
      openedAt: new Date().toLocaleTimeString(),
    };

    setPositions((prev) => [newPosition, ...prev]);

    const newTrade: TradeHistory = {
      id: `th-${Date.now()}`,
      symbol: pair.symbol,
      side,
      price,
      amount,
      total: Number(totalVal.toFixed(2)),
      fee: Number((totalVal * 0.0005).toFixed(2)),
      realizedPnL: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTradeHistory((prev) => [newTrade, ...prev]);
  };

  // Bot Status Toggle
  const handleToggleBotStatus = (botId: string) => {
    setBots((prev) =>
      prev.map((b) => {
        if (b.id === botId) {
          const nextStatus = b.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
          return {
            ...b,
            status: nextStatus,
            lastActive: 'Just now',
            logs: [
              {
                id: `l-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                level: nextStatus === 'RUNNING' ? 'SUCCESS' : 'WARNING',
                message: `Bot status changed to ${nextStatus}`,
              },
              ...b.logs,
            ],
          };
        }
        return b;
      })
    );
  };

  // Toggle All Bots
  const handleToggleAllBots = (running: boolean) => {
    setBots((prev) =>
      prev.map((b) => ({
        ...b,
        status: running ? 'RUNNING' : 'PAUSED',
        lastActive: 'Just now',
      }))
    );
  };

  // Delete Bot
  const handleDeleteBot = (botId: string) => {
    setBots((prev) => prev.filter((b) => b.id !== botId));
  };

  // Create Bot
  const handleCreateBot = (
    newBotData: Omit<BotInstance, 'id' | 'createdAt' | 'lastActive' | 'logs'>
  ) => {
    const newBot: BotInstance = {
      ...newBotData,
      id: `bot-${Date.now()}`,
      createdAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      lastActive: 'Just now',
      logs: [
        {
          id: `l-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'SUCCESS',
          message: `Bot initialized and deployed with strategy ${newBotData.strategy}`,
        },
      ],
    };

    setBots((prev) => [newBot, ...prev]);
  };

  // Close Position
  const handleClosePosition = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    setPaperBalance((prev) => prev + pos.margin + pos.unrealizedPnL);

    setPositions((prev) => prev.filter((p) => p.id !== positionId));

    const newTrade: TradeHistory = {
      id: `th-${Date.now()}`,
      symbol: pos.symbol,
      side: pos.side === 'LONG' ? 'SELL' : 'BUY',
      price: pos.currentPrice,
      amount: pos.size,
      total: Number((pos.size * pos.currentPrice).toFixed(2)),
      fee: Number((pos.size * pos.currentPrice * 0.0005).toFixed(2)),
      realizedPnL: Number(pos.unrealizedPnL.toFixed(2)),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTradeHistory((prev) => [newTrade, ...prev]);
  };

  // Cancel Order
  const handleCancelOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bots={bots}
        onToggleAllBots={handleToggleAllBots}
        onOpenCreateBotModal={() => setIsCreateModalOpen(true)}
        paperBalance={paperBalance}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <MarketOverview
            pairs={pairs}
            selectedPair={selectedPair}
            onSelectPair={setSelectedPair}
            candles={candles}
            onExecutePaperOrder={handleExecutePaperOrder}
            paperBalance={paperBalance}
          />
        )}

        {activeTab === 'bots' && (
          <BotManager
            bots={bots}
            onToggleBotStatus={handleToggleBotStatus}
            onDeleteBot={handleDeleteBot}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        )}

        {activeTab === 'backtest' && <BacktestEngine pairs={pairs} candles={candles} />}

        {activeTab === 'positions' && (
          <PositionsAndOrders
            positions={positions}
            orders={orders}
            tradeHistory={tradeHistory}
            onClosePosition={handleClosePosition}
            onCancelOrder={handleCancelOrder}
          />
        )}

        {activeTab === 'ai-advisor' && <AITradeAdvisor bots={bots} pairs={pairs} />}

        {activeTab === 'risk' && (
          <ExchangesAndRisk
            exchanges={exchanges}
            onUpdateExchange={(id, key, secret) => {
              setExchanges((prev) =>
                prev.map((e) => (e.id === id ? { ...e, apiKey: key, apiSecret: secret, status: 'CONNECTED' } : e))
              );
            }}
            riskLimits={riskLimits}
            onUpdateRiskLimits={setRiskLimits}
          />
        )}
      </main>

      {/* Strategy Creation Modal */}
      <StrategyBuilderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        pairs={pairs}
        onCreateBot={handleCreateBot}
      />

      {/* Footer Status Bar */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-3 text-center text-xs font-mono text-slate-500">
        Trade Bot 2.0 Engine • Real-time WebSocket Feed • Paper Trading Mode
      </footer>

    </div>
  );
}

export default App;
