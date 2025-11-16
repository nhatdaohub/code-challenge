export interface Token {
  currency: string;
  date: string;
  price: number;
}

export interface TokenOption {
  symbol: string;
  name: string;
  price: number;
  icon: string;
}

export interface SwapFormData {
  fromToken: string;
  toToken: string;
  fromAmount: string;
}
