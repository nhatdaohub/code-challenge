import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';
import type { TokenOption, SwapFormData } from '../types';
import { fetchTokenPrices, calculateSwapAmount } from '../services/api';
import { TokenSelector } from './TokenSelector';

const swapSchema = z.object({
  fromToken: z.string().min(1, 'Please select a token'),
  toToken: z.string().min(1, 'Please select a token'),
  fromAmount: z
    .string()
    .min(1, 'Please enter an amount')
    .regex(/^\d*\.?\d*$/, 'Only numbers and one dot are allowed')
    .refine((val) => !Number.isNaN(Number(val)), {
      message: 'Amount must be a valid number',
    })
    .refine((num) => Number(num) > 0, {
      message: 'Amount must be greater than 0',
    }),
});

export const SwapForm = () => {
  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [toAmount, setToAmount] = useState<string>('0');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SwapFormData>({
    resolver: zodResolver(swapSchema),
    defaultValues: {
      fromToken: '',
      toToken: '',
      fromAmount: '',
    },
  });

  const fromToken = watch('fromToken');
  const toToken = watch('toToken');
  const fromAmount = watch('fromAmount');

  useEffect(() => {
    const loadTokens = async () => {
      try {
        const data = await fetchTokenPrices();
        setTokens(data);
        if (data.length > 0) {
          setValue('fromToken', data[0].symbol);
          if (data.length > 1) {
            setValue('toToken', data[1].symbol);
          }
        }
      } catch {
        toast.error('Failed to load tokens');
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, [setValue]);

  useEffect(() => {
    if (fromToken && toToken && fromAmount) {
      const fromTokenData = tokens.find((t) => t.symbol === fromToken);
      const toTokenData = tokens.find((t) => t.symbol === toToken);

      if (fromTokenData && toTokenData) {
        const amount = calculateSwapAmount(
          Number(fromAmount),
          fromTokenData.price,
          toTokenData.price,
        );
        setToAmount(amount.toFixed(6));
      }
    } else {
      setToAmount('0');
    }
  }, [fromToken, toToken, fromAmount, tokens]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setValue('fromToken', toToken);
    setValue('toToken', temp);
  };

  const onSubmit = async (data: SwapFormData) => {
    setSwapping(true);

    // Simulate backend call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success(
      `Successfully swapped ${data.fromAmount} ${data.fromToken} to ${toAmount} ${data.toToken}`,
      { duration: 3000 },
    );

    setSwapping(false);
    setValue('fromAmount', '');
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='w-12 h-12 text-purple-500 animate-spin' />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position='top-right'
        toastOptions={{
          className: 'bg-slate-800 text-white',
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #475569',
          },
        }}
      />
      <div className='min-h-screen flex items-center justify-center p-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-md'
        >
          <div className='bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-6'>
            <div className='text-center mb-8'>
              <h1 className='text-3xl font-bold text-white mb-2'>
                Currency Swap
              </h1>
              <p className='text-gray-400'>
                Exchange cryptocurrencies instantly
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              {/* From Token Section */}
              <div className='bg-slate-800/30 rounded-xl p-4 border border-slate-700'>
                <TokenSelector
                  tokens={tokens}
                  selectedToken={fromToken}
                  onSelect={(token) => setValue('fromToken', token)}
                  label='From'
                />

                <div className='mt-4'>
                  <label
                    htmlFor='fromAmount'
                    className='block text-sm font-medium text-gray-300 mb-2'
                  >
                    Amount
                  </label>
                  <input
                    id='fromAmount'
                    type='text'
                    {...register('fromAmount')}
                    placeholder='0.00'
                    className={clsx(
                      'no-spinner',
                      'w-full px-4 py-3 bg-slate-800/50 border rounded-lg',
                      'text-white text-lg font-medium',
                      'focus:outline-none focus:ring-2 focus:ring-purple-500',
                      'transition-all duration-200',
                      errors.fromAmount ? 'border-red-500' : 'border-slate-700',
                    )}
                  />
                  {errors.fromAmount && (
                    <p className='mt-1 text-sm text-red-400'>
                      {errors.fromAmount.message}
                    </p>
                  )}
                  {fromToken && tokens.find((t) => t.symbol === fromToken) && (
                    <p className='mt-2 text-xs text-gray-400'>
                      ≈ $
                      {(
                        Number(fromAmount || 0) *
                        (tokens.find((t) => t.symbol === fromToken)?.price || 0)
                      ).toFixed(2)}{' '}
                      USD
                    </p>
                  )}
                </div>
              </div>

              {/* Swap Button */}
              <div className='flex justify-center -my-2 relative z-10'>
                <button
                  type='button'
                  onClick={handleSwapTokens}
                  className='p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-110'
                >
                  <ArrowDownUp className='w-5 h-5 text-white' />
                </button>
              </div>

              {/* To Token Section */}
              <div className='bg-slate-800/30 rounded-xl p-4 border border-slate-700'>
                <TokenSelector
                  tokens={tokens}
                  selectedToken={toToken}
                  onSelect={(token) => setValue('toToken', token)}
                  label='To'
                />

                <div className='mt-4'>
                  <div className='block text-sm font-medium text-gray-300 mb-2'>
                    You will receive
                  </div>
                  <div className='w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-lg font-medium'>
                    {toAmount}
                  </div>
                  {toToken && tokens.find((t) => t.symbol === toToken) && (
                    <p className='mt-2 text-xs text-gray-400'>
                      ≈ $
                      {(
                        Number(toAmount || 0) *
                        (tokens.find((t) => t.symbol === toToken)?.price || 0)
                      ).toFixed(2)}{' '}
                      USD
                    </p>
                  )}
                </div>
              </div>

              {/* Exchange Rate */}
              {fromToken && toToken && (
                <div className='bg-slate-800/20 rounded-lg p-3 border border-slate-700/50'>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-400'>Exchange Rate</span>
                    <span className='text-white font-medium'>
                      1 {fromToken} ≈{' '}
                      {calculateSwapAmount(
                        1,
                        tokens.find((t) => t.symbol === fromToken)?.price || 0,
                        tokens.find((t) => t.symbol === toToken)?.price || 0,
                      ).toFixed(6)}{' '}
                      {toToken}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type='submit'
                disabled={swapping}
                className={clsx(
                  'w-full py-4 px-6 rounded-xl font-semibold text-white',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                  swapping
                    ? 'bg-purple-600/50 cursor-not-allowed'
                    : 'bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50',
                )}
              >
                {swapping ? (
                  <span className='flex items-center justify-center'>
                    <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                    Swapping...
                  </span>
                ) : (
                  'Swap Tokens'
                )}
              </button>
            </form>

            <div className='mt-6 text-center text-xs text-gray-500'>
              <p>Powered by Switcheo • Real-time pricing</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
