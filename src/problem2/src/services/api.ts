import axios from 'axios';
import type { Token, TokenOption } from '../types';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICONS_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

// Token metadata for better display names
const TOKEN_METADATA: Record<string, string> = {
  SWTH: 'Switcheo',
  USD: 'US Dollar',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDC: 'USD Coin',
  USDT: 'Tether',
  BUSD: 'Binance USD',
  LUNA: 'Terra Luna',
  ATOM: 'Cosmos',
  BNB: 'Binance Coin',
  SOL: 'Solana',
  MATIC: 'Polygon',
  ADA: 'Cardano',
  DOT: 'Polkadot',
  AVAX: 'Avalanche',
  LINK: 'Chainlink',
  UNI: 'Uniswap',
  AAVE: 'Aave',
  CRV: 'Curve',
  SUSHI: 'SushiSwap',
  WBTC: 'Wrapped Bitcoin',
  GMX: 'GMX',
  BLUR: 'Blur',
  OSMO: 'Osmosis',
  OKB: 'OKB',
  OKT: 'OKT Chain',
  ZIL: 'Zilliqa',
  EVMOS: 'Evmos',
  KUJI: 'Kujira',
  IRIS: 'IRISnet',
  IBCX: 'IBCX',
  STRD: 'Stride',
  USC: 'USC',
  LSI: 'Liquid Staking Index',
};

// Currency to icon filename mapping (handles case differences)
const CURRENCY_TO_ICON: Record<string, string> = {
  STATOM: 'stATOM',
  STLUNA: 'stLUNA',
  STOSMO: 'stOSMO',
  RATOM: 'rATOM',
  RSWTH: 'rSWTH',
  STEVMOS: 'stEVMOS',
  AMPLUNA: 'ampLUNA',
  BNEO: 'bNEO',
  AXLUSDC: 'axlUSDC',
  WSTETH: 'wstETH',
  YIELDUSDC: 'YieldUSD',
};

export const fetchTokenPrices = async (): Promise<TokenOption[]> => {
  try {
    const { data } = await axios.get<Token[]>(PRICES_URL);

    // Group by currency and get the latest price for each
    const tokenMap = new Map<string, Token>();
    for (const token of data) {
      const existing = tokenMap.get(token.currency);
      if (!existing || new Date(token.date) > new Date(existing.date)) {
        tokenMap.set(token.currency, token);
      }
    }

    // Convert to TokenOption array, filtering out tokens without prices
    const tokens: TokenOption[] = Array.from(tokenMap.values())
      .filter((token) => token.price > 0)
      .map((token) => {
        const iconName = CURRENCY_TO_ICON[token.currency] || token.currency;
        const name = TOKEN_METADATA[token.currency] || token.currency;
        return {
          symbol: token.currency,
          name: name,
          price: token.price,
          icon: `${TOKEN_ICONS_BASE}/${iconName}.svg`,
        };
      })
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    return tokens;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    throw new Error('Failed to fetch token prices');
  }
};

export const calculateSwapAmount = (
  fromAmount: number,
  fromPrice: number,
  toPrice: number,
): number => {
  if (!fromAmount || !fromPrice || !toPrice) return 0;
  return (fromAmount * fromPrice) / toPrice;
};
