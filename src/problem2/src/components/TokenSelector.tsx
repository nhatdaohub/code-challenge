import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { TokenOption } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface TokenSelectorProps {
  tokens: TokenOption[];
  selectedToken: string;
  onSelect: (token: string) => void;
  label: string;
  disabled?: boolean;
}

export const TokenSelector = ({
  tokens,
  selectedToken,
  onSelect,
  label,
  disabled = false,
}: TokenSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTokenData = tokens.find((t) => t.symbol === selectedToken);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const filteredTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tokens, searchQuery]);

  const handleSelect = (token: string) => {
    onSelect(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <label className='block text-sm font-medium text-gray-300 mb-2'>
        {label}
      </label>
      <button
        type='button'
        onClick={() => !disabled && setIsOpen((open) => !open)}
        disabled={disabled}
        className={clsx(
          'w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg',
          'flex items-center justify-between',
          'hover:bg-slate-800/70 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-purple-500',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {selectedTokenData ? (
          <div className='flex items-center space-x-3'>
            <img
              src={selectedTokenData.icon}
              alt={selectedTokenData.symbol}
              className='w-6 h-6 rounded-full'
            />
            <div className='text-left'>
              <div className='text-white font-medium'>
                {selectedTokenData.symbol}
              </div>
              <div className='text-xs text-gray-400'>
                {selectedTokenData.name}
              </div>
            </div>
          </div>
        ) : (
          <span className='text-gray-400'>Select token</span>
        )}
        <ChevronDown
          className={clsx(
            'w-5 h-5 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className='absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden'
          >
            <div className='p-3 border-b border-slate-700'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search tokens...'
                  className='w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
                  autoFocus
                />
              </div>
            </div>
            <div className='max-h-64 overflow-y-auto'>
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <button
                    key={token.symbol}
                    type='button'
                    onClick={() => handleSelect(token.symbol)}
                    className={clsx(
                      'w-full px-4 py-3 flex items-center space-x-3',
                      'hover:bg-slate-700/50 transition-colors duration-150',
                      'text-left',
                      token.symbol === selectedToken && 'bg-purple-900/30',
                    )}
                  >
                    <img
                      src={token.icon}
                      alt={token.symbol}
                      className='w-8 h-8 rounded-full'
                    />
                    <div className='flex-1'>
                      <div className='text-white font-medium'>
                        {token.symbol}
                      </div>
                      <div className='text-xs text-gray-400'>{token.name}</div>
                    </div>
                    <div className='text-sm text-gray-300'>
                      ${token.price.toFixed(6)}
                    </div>
                  </button>
                ))
              ) : (
                <div className='px-4 py-8 text-center text-gray-400'>
                  No tokens found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
