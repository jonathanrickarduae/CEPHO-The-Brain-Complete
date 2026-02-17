/**
 * Victoria AI Briefing Service
 * Generates professional briefings for trading activities
 */

import { type TradingSignal } from './trading-signal-service';

export interface VictoriaBriefing {
  id: string;
  timestamp: Date;
  briefingType: 'morning' | 'hourly' | 'evening' | 'alert';
  subject: string;
  content: string;
  summary: string;
  signals: TradingSignal[];
  performance?: {
    totalTrades: number;
    profitableTrades: number;
    currentPnL: number;
    roi: number;
  };
}

/**
 * Generate morning briefing
 */
export async function generateMorningBriefing(
  userName: string = 'Jonathan',
  signals: TradingSignal[] = []
): Promise<VictoriaBriefing> {
  const timestamp = new Date();
  const currentSignal = signals[0];
  
  const content = `
Good morning, ${userName}! 👋

**Daily Trading Brief - ${timestamp.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**

---

## 🎯 Today's Market Overview

**Apple Inc. (AAPL)** is showing ${currentSignal?.action === 'BUY' ? 'bullish momentum' : currentSignal?.action === 'SELL' ? 'bearish pressure' : 'mixed signals'} in pre-market analysis.

**Current Status:**
• Price: $${currentSignal?.price.toFixed(2) || 'N/A'}
• Change: ${currentSignal?.metadata.quote.changePercent.toFixed(2)}% ${currentSignal?.metadata.quote.change > 0 ? '📈' : '📉'}
• Volume: ${(currentSignal?.metadata.quote.volume / 1000000).toFixed(1)}M

---

## 📊 Technical Analysis

${currentSignal ? `
**Signal Generated:** ${currentSignal.action}
**Confidence:** ${currentSignal.confidence}%
**Risk Level:** ${currentSignal.metadata.riskLevel}

**Key Indicators:**
• RSI: ${currentSignal.indicators.rsi.toFixed(2)} ${currentSignal.indicators.rsi < 30 ? '(Oversold)' : currentSignal.indicators.rsi > 70 ? '(Overbought)' : '(Neutral)'}
• MACD: ${currentSignal.indicators.macd.value.toFixed(2)} ${currentSignal.indicators.macd.histogram > 0 ? '(Bullish)' : '(Bearish)'}
• SMA20: $${currentSignal.indicators.movingAverages.sma20.toFixed(2)}
• SMA50: $${currentSignal.indicators.movingAverages.sma50.toFixed(2)}

**Price Targets:**
${currentSignal.metadata.targetPrice ? `• Target: $${currentSignal.metadata.targetPrice.toFixed(2)}` : ''}
${currentSignal.metadata.stopLoss ? `• Stop Loss: $${currentSignal.metadata.stopLoss.toFixed(2)}` : ''}
` : 'No signal available yet.'}

---

## 💡 Victoria's Recommendation

${generateRecommendation(currentSignal)}

---

## ⏰ Today's Schedule

**9:30 AM** - Market opens
**12:00 PM** - Midday review
**4:00 PM** - Market closes
**5:00 PM** - Evening performance review

---

**Have a productive trading day!**

Best regards,
**Victoria** 🤖
*Your AI Chief of Staff*
  `.trim();

  const summary = currentSignal 
    ? `${currentSignal.action} signal generated for AAPL at $${currentSignal.price.toFixed(2)} with ${currentSignal.confidence}% confidence`
    : 'Morning briefing prepared - awaiting market data';

  return {
    id: `briefing-morning-${Date.now()}`,
    timestamp,
    briefingType: 'morning',
    subject: `Morning Trading Brief - ${timestamp.toLocaleDateString()}`,
    content,
    summary,
    signals
  };
}

/**
 * Generate hourly update
 */
export async function generateHourlyUpdate(
  userName: string = 'Jonathan',
  currentSignal: TradingSignal,
  previousSignals: TradingSignal[] = []
): Promise<VictoriaBriefing> {
  const timestamp = new Date();
  
  const content = `
**Hourly Update - ${timestamp.toLocaleTimeString()}**

Hi ${userName},

Quick update on AAPL trading activity:

**Latest Signal:** ${currentSignal.action}
**Price:** $${currentSignal.price.toFixed(2)} (${currentSignal.metadata.quote.changePercent.toFixed(2)}%)
**Confidence:** ${currentSignal.confidence}%

${currentSignal.action !== 'HOLD' ? `
**Action Required:**
${currentSignal.action === 'BUY' 
  ? `Consider entering a position at current levels. Target: $${currentSignal.metadata.targetPrice?.toFixed(2)}, Stop: $${currentSignal.metadata.stopLoss?.toFixed(2)}`
  : `Consider taking profits or reducing exposure. Target: $${currentSignal.metadata.targetPrice?.toFixed(2)}, Stop: $${currentSignal.metadata.stopLoss?.toFixed(2)}`
}
` : '**No action needed** - Continue monitoring'}

**Technical Summary:**
${currentSignal.reasoning.split('\n').slice(0, 5).join('\n')}

---
Victoria 🤖
  `.trim();

  return {
    id: `briefing-hourly-${Date.now()}`,
    timestamp,
    briefingType: 'hourly',
    subject: `Hourly Update - ${currentSignal.action} Signal`,
    content,
    summary: `${currentSignal.action} at $${currentSignal.price.toFixed(2)}`,
    signals: [currentSignal]
  };
}

/**
 * Generate evening performance review
 */
export async function generateEveningReview(
  userName: string = 'Jonathan',
  signals: TradingSignal[],
  performance: VictoriaBriefing['performance']
): Promise<VictoriaBriefing> {
  const timestamp = new Date();
  
  const content = `
Good evening, ${userName}! 🌙

**Daily Performance Review - ${timestamp.toLocaleDateString()}**

---

## 📈 Trading Performance

${performance ? `
**Today's Results:**
• Total Trades: ${performance.totalTrades}
• Profitable Trades: ${performance.profitableTrades}
• Win Rate: ${performance.totalTrades > 0 ? ((performance.profitableTrades / performance.totalTrades) * 100).toFixed(1) : 0}%
• P&L: $${performance.currentPnL.toFixed(2)} ${performance.currentPnL >= 0 ? '✅' : '❌'}
• ROI: ${performance.roi.toFixed(2)}%

${performance.roi >= 10 
  ? '🎉 **Excellent performance!** You\'re on track to meet your $1,000 target.'
  : performance.roi >= 0
  ? '👍 **Positive day!** Keep up the disciplined approach.'
  : '⚠️ **Review needed.** Let\'s analyze what went wrong and adjust strategy.'}
` : 'No trades executed today.'}

---

## 📊 Signal Summary

**Signals Generated:** ${signals.length}

${signals.map((s, i) => `
**Signal ${i + 1}** (${s.timestamp.toLocaleTimeString()})
• Action: ${s.action}
• Price: $${s.price.toFixed(2)}
• Confidence: ${s.confidence}%
• Result: ${s.action === 'HOLD' ? 'No action taken' : 'Pending'}
`).join('\n')}

---

## 💭 Victoria's Insights

${generateDailyInsights(signals, performance)}

---

## 📅 Tomorrow's Plan

1. **Review overnight news** - Check for any AAPL announcements
2. **Pre-market analysis** - Assess gap up/down scenarios
3. **Strategy adjustment** - ${performance && performance.roi < 0 ? 'Refine entry/exit criteria' : 'Continue current approach'}
4. **Risk management** - ${performance && performance.roi < 0 ? 'Reduce position size' : 'Maintain discipline'}

---

**Rest well and prepare for tomorrow's opportunities!**

Best regards,
**Victoria** 🤖
*Your AI Chief of Staff*
  `.trim();

  return {
    id: `briefing-evening-${Date.now()}`,
    timestamp,
    briefingType: 'evening',
    subject: `Evening Review - ${performance ? `${performance.roi >= 0 ? '✅' : '❌'} ${performance.roi.toFixed(2)}% ROI` : 'No Trades'}`,
    content,
    summary: performance 
      ? `${performance.totalTrades} trades, ${performance.roi.toFixed(2)}% ROI, $${performance.currentPnL.toFixed(2)} P&L`
      : 'No trading activity today',
    signals,
    performance
  };
}

/**
 * Generate alert briefing for significant events
 */
export async function generateAlert(
  userName: string = 'Jonathan',
  signal: TradingSignal,
  alertType: 'strong_buy' | 'strong_sell' | 'target_reached' | 'stop_loss'
): Promise<VictoriaBriefing> {
  const timestamp = new Date();
  
  const alertMessages = {
    strong_buy: `🚨 **STRONG BUY SIGNAL** - AAPL at $${signal.price.toFixed(2)} with ${signal.confidence}% confidence!`,
    strong_sell: `⚠️ **STRONG SELL SIGNAL** - AAPL at $${signal.price.toFixed(2)} with ${signal.confidence}% confidence!`,
    target_reached: `🎯 **TARGET REACHED** - AAPL hit target price of $${signal.metadata.targetPrice?.toFixed(2)}!`,
    stop_loss: `🛑 **STOP LOSS TRIGGERED** - AAPL hit stop loss at $${signal.metadata.stopLoss?.toFixed(2)}`
  };
  
  const content = `
**ALERT** - ${timestamp.toLocaleTimeString()}

${alertMessages[alertType]}

${userName}, immediate attention required:

${signal.reasoning}

**Recommended Action:**
${alertType === 'strong_buy' ? 'Consider entering position immediately'
  : alertType === 'strong_sell' ? 'Consider exiting position or taking profits'
  : alertType === 'target_reached' ? 'Consider taking profits'
  : 'Exit position to limit losses'}

---
Victoria 🤖
  `.trim();

  return {
    id: `briefing-alert-${Date.now()}`,
    timestamp,
    briefingType: 'alert',
    subject: alertMessages[alertType],
    content,
    summary: alertMessages[alertType],
    signals: [signal]
  };
}

// ============ Helper Functions ============

function generateRecommendation(signal?: TradingSignal): string {
  if (!signal) {
    return 'Awaiting market data to generate recommendations.';
  }
  
  if (signal.action === 'BUY' && signal.confidence >= 70) {
    return `Strong buying opportunity detected. Technical indicators are aligned for upward movement. Consider entering a position with ${signal.metadata.riskLevel} risk profile. Set your stop loss at $${signal.metadata.stopLoss?.toFixed(2)} and target $${signal.metadata.targetPrice?.toFixed(2)} for a favorable risk/reward ratio.`;
  } else if (signal.action === 'BUY') {
    return `Moderate buying opportunity. While indicators lean bullish, confidence is moderate. Consider a smaller position size or wait for stronger confirmation. Monitor price action closely.`;
  } else if (signal.action === 'SELL' && signal.confidence >= 70) {
    return `Strong selling signal detected. Technical indicators suggest downward pressure. If you have open positions, consider taking profits. Avoid new long positions until market sentiment improves.`;
  } else if (signal.action === 'SELL') {
    return `Moderate selling pressure detected. Consider reducing exposure or tightening stop losses on existing positions. Not an urgent exit signal, but caution is advised.`;
  } else {
    return `Mixed signals suggest a wait-and-see approach. Market is in consolidation. Use this time to review your strategy and prepare for the next clear opportunity. Patience is key in trading.`;
  }
}

function generateDailyInsights(signals: TradingSignal[], performance?: VictoriaBriefing['performance']): string {
  const buySignals = signals.filter(s => s.action === 'BUY').length;
  const sellSignals = signals.filter(s => s.action === 'SELL').length;
  const holdSignals = signals.filter(s => s.action === 'HOLD').length;
  
  let insights = `Today we generated ${signals.length} signals: ${buySignals} BUY, ${sellSignals} SELL, ${holdSignals} HOLD. `;
  
  if (buySignals > sellSignals) {
    insights += 'The market showed predominantly bullish sentiment. ';
  } else if (sellSignals > buySignals) {
    insights += 'The market showed predominantly bearish sentiment. ';
  } else {
    insights += 'The market was indecisive with mixed signals. ';
  }
  
  if (performance) {
    if (performance.roi >= 5) {
      insights += 'Your disciplined approach to following signals paid off well. Continue this strategy tomorrow.';
    } else if (performance.roi >= 0) {
      insights += 'Positive results, though modest. Consider being more selective with entry points.';
    } else {
      insights += 'Today\'s losses suggest we need to refine our entry/exit timing. Let\'s review the signals that didn\'t work out and adjust our confidence thresholds.';
    }
  }
  
  return insights;
}

/**
 * Generate briefing based on type
 * Wrapper function for mock day testing
 */
export async function generateBriefing(
  symbol: string,
  type: 'morning' | 'hourly' | 'evening' | 'alert',
  userName: string = 'Jonathan'
): Promise<VictoriaBriefing> {
  // For mock testing, we'll generate a sample signal
  const { generateSignal } = await import('./trading-signal-service');
  const signal = await generateSignal(symbol);
  
  switch (type) {
    case 'morning':
      return generateMorningBriefing(userName, [signal]);
    case 'hourly':
      return generateHourlyUpdate(userName, [signal]);
    case 'evening':
      return generateEveningReview(userName, [signal]);
    case 'alert':
      return generateAlert(userName, signal, 'strong_buy');
    default:
      return generateMorningBriefing(userName, [signal]);
  }
}
