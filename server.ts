import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Trade Bot 2.0 Engine', timestamp: new Date().toISOString() });
  });

  // Server-side Gemini API AI Strategy Advisor
  app.post('/api/gemini/analyze-strategy', async (req, res) => {
    const { symbol, strategy, currentPrice, userQuery, botLogs, config } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const fallbackAnalysis = `### 1. Market & Strategy Alignment
Your **${symbol || 'BTC/USDT'}** bot using **${strategy || 'Grid Scalper'}** is positioned in a volatile consolidation phase around **$${currentPrice || '64,850'}**. The entry triggers are aligned with local moving average support.

### 2. Quantitative Risk Evaluation
- **Leverage Risk**: ${config?.leverage || 3}x leverage provides amplified upside while keeping liquidation distant (${((currentPrice || 64850) * (1 - 1 / (config?.leverage || 3) * 0.8)).toFixed(0)} USDT).
- **Stop Loss Guard**: Set at -${config?.stopLossPct || 5}%, limiting worst-case drawdown per trade.

### 3. Specific Parameter Tuning Suggestions
- **Grid Density**: Consider expanding grid lower bounds if volume drops below 1.2B.
- **Take Profit**: Lock in fractional profits at +${config?.takeProfitPct || 15}% using a trailing stop of 2%.`;

    if (!apiKey) {
      return res.json({
        success: true,
        isMock: true,
        analysis: `[AI Advisor Simulation Mode — GEMINI_API_KEY not configured]\n\n${fallbackAnalysis}`,
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an elite quantitative trading bot advisor and financial algorithms expert for Trade Bot 2.0.
Analyze the following bot setup and market metrics:
- Asset: ${symbol || 'BTC/USDT'}
- Current Price: $${currentPrice}
- Selected Strategy: ${strategy}
- Strategy Config: ${JSON.stringify(config || {})}
- User Question: ${userQuery || 'Analyze this strategy configuration for risk and optimization recommendations.'}

Provide concise, highly readable, practical, actionable feedback formatted in markdown. Include 3 distinct sections:
1. Market & Strategy Alignment
2. Quantitative Risk Evaluation
3. Specific Parameter Tuning Suggestions`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      return res.json({
        success: true,
        isMock: false,
        analysis: response.text || fallbackAnalysis,
      });
    } catch (error: any) {
      console.warn('Gemini API call failed, providing fallback quantitative analysis:', error.message);
      return res.json({
        success: true,
        isMock: true,
        analysis: `[AI Advisor Simulation Mode — ${error.message?.includes('Quota') ? 'Rate Limit Quota Reached' : 'API Service Unavailable'}]\n\n${fallbackAnalysis}`,
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Trade Bot 2.0 Engine] Running on http://localhost:${PORT}`);
  });
}

startServer();
