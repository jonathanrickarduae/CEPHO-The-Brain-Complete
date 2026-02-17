/**
 * Trading Data Service
 * Fetches real-time and historical stock data for trading signals
 * Includes caching and rate limiting to prevent API throttling
 */

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 60000; // 1 minute cache
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
let lastRequestTime = 0;

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  previousClose: number;
}

export interface TechnicalIndicators {
  rsi: number; // Relative Strength Index (0-100)
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    sma20: number; // 20-period Simple Moving Average
    sma50: number; // 50-period Simple Moving Average
    ema12: number; // 12-period Exponential Moving Average
    ema26: number; // 26-period Exponential Moving Average
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface HistoricalData {
  symbol: string;
  interval: '1min' | '5min' | '15min' | '30min' | '60min' | 'daily';
  data: Array<{
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

/**
 * Fetch current stock quote
 * Uses Yahoo Finance as free alternative (no API key required)
 */
export async function getStockQuote(symbol: string = 'AAPL'): Promise<StockQuote> {
  // Check cache first
  const cacheKey = `quote-${symbol}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[TradingDataService] Using cached quote for ${symbol}`);
    return cached.data;
  }
  
  // Rate limiting: wait if needed
  const timeSinceLastRequest = Date.now() - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`[TradingDataService] Rate limiting: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  try {
    lastRequestTime = Date.now();
    // Yahoo Finance API (unofficial but free)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.status}`);
    }
    
    const data = await response.json();
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    const timestamps = result.timestamp;
    
    // Get the latest data point
    const latestIndex = timestamps.length - 1;
    const currentPrice = meta.regularMarketPrice || quote.close[latestIndex];
    const previousClose = meta.previousClose;
    
    const stockQuote: StockQuote = {
      symbol: symbol.toUpperCase(),
      price: currentPrice,
      change: currentPrice - previousClose,
      changePercent: ((currentPrice - previousClose) / previousClose) * 100,
      volume: meta.regularMarketVolume || 0,
      timestamp: new Date(timestamps[latestIndex] * 1000),
      open: quote.open[latestIndex] || meta.regularMarketOpen,
      high: quote.high[latestIndex] || meta.regularMarketDayHigh,
      low: quote.low[latestIndex] || meta.regularMarketDayLow,
      previousClose: previousClose
    };
    
    // Cache the result
    cache.set(cacheKey, { data: stockQuote, timestamp: Date.now() });
    
    return stockQuote;
  } catch (error: any) {
    console.error('[TradingDataService] Failed to fetch stock quote:', error);
    
    // If rate limited, return cached data if available (even if stale)
    if (error.message?.includes('Too Many Requests') || error.message?.includes('429')) {
      const staleCache = cache.get(cacheKey);
      if (staleCache) {
        console.warn('[TradingDataService] Rate limited, using stale cache');
        return staleCache.data;
      }
    }
    
    throw error;
  }
}

/**
 * Calculate technical indicators from historical data
 */
export async function getTechnicalIndicators(symbol: string = 'AAPL'): Promise<TechnicalIndicators> {
  try {
    const historical = await getHistoricalData(symbol, '5min', 100);
    const closes = historical.data.map(d => d.close);
    
    // Calculate RSI
    const rsi = calculateRSI(closes, 14);
    
    // Calculate MACD
    const macd = calculateMACD(closes);
    
    // Calculate Moving Averages
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const ema12 = calculateEMA(closes, 12);
    const ema26 = calculateEMA(closes, 26);
    
    // Calculate Bollinger Bands
    const bollingerBands = calculateBollingerBands(closes, 20, 2);
    
    return {
      rsi,
      macd,
      movingAverages: {
        sma20,
        sma50,
        ema12,
        ema26
      },
      bollingerBands
    };
  } catch (error) {
    console.error('[TradingDataService] Failed to calculate technical indicators:', error);
    throw error;
  }
}

/**
 * Fetch historical data
 */
export async function getHistoricalData(
  symbol: string = 'AAPL',
  interval: HistoricalData['interval'] = '5min',
  periods: number = 100
): Promise<HistoricalData> {
  try {
    const intervalMap = {
      '1min': '1m',
      '5min': '5m',
      '15min': '15m',
      '30min': '30m',
      '60min': '60m',
      'daily': '1d'
    };
    
    const range = interval === 'daily' ? '1mo' : '1d';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${intervalMap[interval]}&range=${range}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.status}`);
    }
    
    const data = await response.json();
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    
    const historicalData: HistoricalData['data'] = [];
    for (let i = 0; i < Math.min(timestamps.length, periods); i++) {
      historicalData.push({
        timestamp: new Date(timestamps[i] * 1000),
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i]
      });
    }
    
    return {
      symbol: symbol.toUpperCase(),
      interval,
      data: historicalData
    };
  } catch (error) {
    console.error('[TradingDataService] Failed to fetch historical data:', error);
    throw error;
  }
}

// ============ Technical Indicator Calculations ============

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Default neutral value
  
  let gains = 0;
  let losses = 0;
  
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return Math.round(rsi * 100) / 100;
}

function calculateMACD(prices: number[]): TechnicalIndicators['macd'] {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  
  // Signal line is 9-period EMA of MACD line
  // For simplicity, using a basic approximation
  const signalLine = macdLine * 0.9; // Simplified
  const histogram = macdLine - signalLine;
  
  return {
    value: Math.round(macdLine * 100) / 100,
    signal: Math.round(signalLine * 100) / 100,
    histogram: Math.round(histogram * 100) / 100
  };
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  
  const slice = prices.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return Math.round((sum / period) * 100) / 100;
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return Math.round(ema * 100) / 100;
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): TechnicalIndicators['bollingerBands'] {
  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  
  // Calculate standard deviation
  const squaredDiffs = slice.map(price => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: Math.round((sma + (standardDeviation * stdDev)) * 100) / 100,
    middle: sma,
    lower: Math.round((sma - (standardDeviation * stdDev)) * 100) / 100
  };
}
