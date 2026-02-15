/**
 * Trading Signal Service
 * Generates buy/sell/hold signals based on technical analysis and AI
 */

import { getStockQuote, getTechnicalIndicators, type StockQuote, type TechnicalIndicators } from './trading-data-service';

export interface TradingSignal {
  id: string;
  timestamp: Date;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  price: number;
  confidence: number; // 0-100
  indicators: TechnicalIndicators;
  reasoning: string;
  metadata: {
    quote: StockQuote;
    technicalScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    targetPrice?: number;
    stopLoss?: number;
  };
}

/**
 * Generate trading signal based on technical analysis
 */
export async function generateSignal(symbol: string = 'AAPL'): Promise<TradingSignal> {
  try {
    console.log(`[TradingSignalService] Generating signal for ${symbol}...`);
    
    // Fetch current quote and technical indicators
    const quote = await getStockQuote(symbol);
    const indicators = await getTechnicalIndicators(symbol);
    
    // Analyze indicators
    const analysis = analyzeTechnicals(quote, indicators);
    
    // Generate signal
    const signal: TradingSignal = {
      id: `signal-${symbol}-${Date.now()}`,
      timestamp: new Date(),
      symbol: symbol.toUpperCase(),
      action: analysis.action,
      price: quote.price,
      confidence: analysis.confidence,
      indicators,
      reasoning: analysis.reasoning,
      metadata: {
        quote,
        technicalScore: analysis.technicalScore,
        riskLevel: analysis.riskLevel,
        targetPrice: analysis.targetPrice,
        stopLoss: analysis.stopLoss
      }
    };
    
    console.log(`[TradingSignalService] Signal generated: ${signal.action} with ${signal.confidence}% confidence`);
    
    return signal;
  } catch (error) {
    console.error('[TradingSignalService] Failed to generate signal:', error);
    throw error;
  }
}

interface TechnicalAnalysis {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  technicalScore: number;
  reasoning: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  targetPrice?: number;
  stopLoss?: number;
}

/**
 * Analyze technical indicators to determine trading action
 */
function analyzeTechnicals(quote: StockQuote, indicators: TechnicalIndicators): TechnicalAnalysis {
  const signals: string[] = [];
  let bullishPoints = 0;
  let bearishPoints = 0;
  
  // RSI Analysis (0-100)
  if (indicators.rsi < 30) {
    bullishPoints += 3;
    signals.push(`RSI oversold at ${indicators.rsi.toFixed(2)} (strong buy signal)`);
  } else if (indicators.rsi < 40) {
    bullishPoints += 1;
    signals.push(`RSI at ${indicators.rsi.toFixed(2)} (mild buy signal)`);
  } else if (indicators.rsi > 70) {
    bearishPoints += 3;
    signals.push(`RSI overbought at ${indicators.rsi.toFixed(2)} (strong sell signal)`);
  } else if (indicators.rsi > 60) {
    bearishPoints += 1;
    signals.push(`RSI at ${indicators.rsi.toFixed(2)} (mild sell signal)`);
  } else {
    signals.push(`RSI neutral at ${indicators.rsi.toFixed(2)}`);
  }
  
  // MACD Analysis
  if (indicators.macd.histogram > 0) {
    bullishPoints += 2;
    signals.push(`MACD bullish (histogram: ${indicators.macd.histogram.toFixed(2)})`);
  } else if (indicators.macd.histogram < 0) {
    bearishPoints += 2;
    signals.push(`MACD bearish (histogram: ${indicators.macd.histogram.toFixed(2)})`);
  }
  
  // Moving Average Analysis
  const price = quote.price;
  const { sma20, sma50 } = indicators.movingAverages;
  
  if (price > sma20 && price > sma50) {
    bullishPoints += 2;
    signals.push(`Price above both SMA20 ($${sma20.toFixed(2)}) and SMA50 ($${sma50.toFixed(2)})`);
  } else if (price < sma20 && price < sma50) {
    bearishPoints += 2;
    signals.push(`Price below both SMA20 ($${sma20.toFixed(2)}) and SMA50 ($${sma50.toFixed(2)})`);
  }
  
  if (sma20 > sma50) {
    bullishPoints += 1;
    signals.push('Golden cross pattern (SMA20 > SMA50)');
  } else if (sma20 < sma50) {
    bearishPoints += 1;
    signals.push('Death cross pattern (SMA20 < SMA50)');
  }
  
  // Bollinger Bands Analysis
  const { upper, middle, lower } = indicators.bollingerBands;
  
  if (price <= lower) {
    bullishPoints += 2;
    signals.push(`Price at lower Bollinger Band ($${lower.toFixed(2)}) - potential bounce`);
  } else if (price >= upper) {
    bearishPoints += 2;
    signals.push(`Price at upper Bollinger Band ($${upper.toFixed(2)}) - potential reversal`);
  }
  
  // Calculate technical score (-100 to +100)
  const technicalScore = Math.min(100, Math.max(-100, (bullishPoints - bearishPoints) * 10));
  
  // Determine action
  let action: 'BUY' | 'SELL' | 'HOLD';
  let confidence: number;
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  
  if (technicalScore >= 40) {
    action = 'BUY';
    confidence = Math.min(95, 50 + (technicalScore / 2));
    riskLevel = technicalScore >= 60 ? 'LOW' : 'MEDIUM';
  } else if (technicalScore <= -40) {
    action = 'SELL';
    confidence = Math.min(95, 50 + (Math.abs(technicalScore) / 2));
    riskLevel = technicalScore <= -60 ? 'LOW' : 'MEDIUM';
  } else {
    action = 'HOLD';
    confidence = 50 + Math.abs(technicalScore);
    riskLevel = 'MEDIUM';
  }
  
  // Calculate target price and stop loss
  let targetPrice: number | undefined;
  let stopLoss: number | undefined;
  
  if (action === 'BUY') {
    // Target: 2% above current price or upper Bollinger Band
    targetPrice = Math.max(price * 1.02, upper);
    // Stop loss: 1% below current price or lower Bollinger Band
    stopLoss = Math.min(price * 0.99, lower);
  } else if (action === 'SELL') {
    // Target: 2% below current price or lower Bollinger Band
    targetPrice = Math.min(price * 0.98, lower);
    // Stop loss: 1% above current price or upper Bollinger Band
    stopLoss = Math.max(price * 1.01, upper);
  }
  
  // Generate reasoning
  const reasoning = `
**Technical Analysis Summary:**

**Action:** ${action} with ${confidence.toFixed(0)}% confidence
**Risk Level:** ${riskLevel}
**Technical Score:** ${technicalScore.toFixed(0)}/100 (${bullishPoints} bullish vs ${bearishPoints} bearish signals)

**Key Indicators:**
${signals.map(s => `• ${s}`).join('\n')}

**Price Targets:**
• Current Price: $${price.toFixed(2)}
${targetPrice ? `• Target Price: $${targetPrice.toFixed(2)} (${((targetPrice - price) / price * 100).toFixed(2)}%)` : ''}
${stopLoss ? `• Stop Loss: $${stopLoss.toFixed(2)} (${((stopLoss - price) / price * 100).toFixed(2)}%)` : ''}

**Recommendation:**
${action === 'BUY' 
  ? 'Technical indicators suggest a buying opportunity. Consider entering a position with proper risk management.'
  : action === 'SELL'
  ? 'Technical indicators suggest taking profits or avoiding new positions. Consider reducing exposure.'
  : 'Mixed signals suggest waiting for clearer market direction. Monitor for breakout above resistance or breakdown below support.'}
  `.trim();
  
  return {
    action,
    confidence: Math.round(confidence),
    technicalScore,
    reasoning,
    riskLevel,
    targetPrice,
    stopLoss
  };
}

/**
 * Generate AI-enhanced signal (future enhancement)
 */
export async function generateAIEnhancedSignal(symbol: string = 'AAPL'): Promise<TradingSignal> {
  // For now, return technical signal
  // TODO: Add AI analysis using Claude/GPT for sentiment analysis, news impact, etc.
  const signal = await generateSignal(symbol);
  
  // Future: Enhance with AI
  // - Analyze recent news sentiment
  // - Check market conditions
  // - Consider broader market trends
  // - Factor in earnings reports, etc.
  
  return signal;
}

/**
 * Backtest signal accuracy (for validation)
 */
export async function backtestSignals(symbol: string, days: number = 7): Promise<{
  totalSignals: number;
  profitable: number;
  accuracy: number;
  avgProfit: number;
}> {
  // TODO: Implement backtesting logic
  // - Generate historical signals
  // - Compare with actual price movements
  // - Calculate win rate and profitability
  
  return {
    totalSignals: 0,
    profitable: 0,
    accuracy: 0,
    avgProfit: 0
  };
}
