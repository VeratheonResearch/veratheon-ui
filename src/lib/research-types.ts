// TypeScript interfaces matching Python dataclasses from veratheon-research

/**
 * Economic indicator with value and trend context.
 * Maps to Python EconomicIndicator dataclass.
 */
export interface EconomicIndicator {
  name: string;
  value: string | null;
  previous_value: string | null;
  date: string | null;
  trend: 'up' | 'down' | 'stable' | null;
  context: string | null;
  error: string | null;
}

/**
 * Market/volatility indicator with price data.
 * Maps to Python MarketIndicator dataclass.
 */
export interface MarketIndicator {
  name: string;
  symbol: string;
  price: string | null;
  change: string | null;
  change_percent: string | null;
  date: string | null;
  error: string | null;
}

/**
 * Macro economic report with all indicators.
 * Maps to Python MacroReport dataclass (via to_dict()).
 */
export interface MacroReport {
  generated_at: string;
  inflation: {
    cpi?: EconomicIndicator;
    inflation_rate?: EconomicIndicator;
  };
  employment: {
    unemployment_rate?: EconomicIndicator;
    nonfarm_payroll?: EconomicIndicator;
  };
  interest_rates: {
    fed_funds_rate?: EconomicIndicator;
    treasury_10y?: EconomicIndicator;
    treasury_2y?: EconomicIndicator;
  };
  growth: {
    real_gdp?: EconomicIndicator;
  };
  market: {
    vix?: MarketIndicator;
    sp500?: MarketIndicator;
    sector_etf?: MarketIndicator;
  };
}

/**
 * Result from the autonomous research workflow.
 * Maps to Python WorkflowResult dataclass.
 */
export interface WorkflowResult {
  symbol: string;
  quantitative_report: string | null;
  qualitative_report: string | null;
  macro_report: MacroReport | null;
  synthesis_report: string | null;
  trade_advice: string | null;
  error?: string | null;
}

// Trade-related interfaces
export interface TradeDetails {
  symbol: string;
  instrumentType: 'stock' | 'option';
  direction: 'long' | 'short';
  optionType: 'call' | 'put' | null;
  strikePrice: number | null;
  expirationDate: string;
  isHedge: boolean;
  rationale: string;
}

export interface Trade extends TradeDetails {
  id: string;
  timestamp: string;
  status: 'pending' | 'validated' | 'invalidated';
  validationReason?: string;
}

export interface TradeResponse {
  success: boolean;
  message: string;
  trade?: Trade;
  error?: string;
}

export interface TradeValidationRequest {
  tradeId: string;
  symbol: string;
  researchData?: WorkflowResult;
}