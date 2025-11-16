import { useMemo } from 'react';

// Mock hooks
const useWalletBalances = (): WalletBalance[] => {
  return [];
};

// Mock hooks
const usePrices = (): Record<string, number> => {
  return {};
};

interface WalletBalance {
  currency: string;
  amount: number;
}

// Fix: extend FormattedWalletBalance from WalletBalance
interface FormattedWalletBalance extends WalletBalance {
  formattedAmount: string; // Fix: rename formatted to formattedAmount for clarity
  usdValue: number; // Fix: add usdValue
}

// Fix: use PRIORITY_MAP Config rather than function for quick lookup
const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

// Mock WalletRow component
const WalletRow: React.FC<FormattedWalletBalance & { className?: string }> = ({
  className,
  amount,
  currency,
  formattedAmount,
  usdValue,
}) => {
  return (
    <div className={className}>
      <span>Currency: {currency}</span>
      <span>Amount: {formattedAmount}</span>
      <span>Raw: {amount}</span>
      <span>USD Value: ${usdValue.toFixed(2)}</span>
    </div>
  );
};

// Fix: should not define props when not needed, name it clearly
interface WalletPageProps {
  className?: string;
}

const WalletPage: React.FC<WalletPageProps> = ({ className }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Fix: use one memo for compute filtered, sorted, formatted, no need to use many memoed values
  const processedBalances = useMemo(() => {
    return (
      balances
        //Fix: use PRIORITY_MAP and filter out undefined balances, change blockchain to currency prop
        .filter(
          (balance) => PRIORITY_MAP[balance.currency] && balance.amount > 0,
        )
        // Fix: sorten comparison and make sure function returns value
        .sort((a, b) => PRIORITY_MAP[b.currency] - PRIORITY_MAP[a.currency])
        .map((b) => ({
          currency: b.currency,
          amount: b.amount,
          formattedAmount: b.amount.toFixed(2), // Fix: toFixed for x decimal places
          usdValue: (prices[b.currency] ?? 0) * b.amount, // Fix: catch case prices[b.currency] undefined
        }))
    );
  }, [balances, prices]);

  return (
    // Fix: acknowledge props before passing in div
    <div className={className}>
      {processedBalances.map((balance) => {
        return (
          // Fix: add key prop rather than using index, remove classes while classes is not defined
          <WalletRow
            key={balance.currency}
            currency={balance.currency}
            amount={balance.amount}
            formattedAmount={balance.formattedAmount}
            usdValue={balance.usdValue}
          />
        );
      })}
    </div>
  );
};

// Fix: should export WalletPage for use
export default WalletPage;
