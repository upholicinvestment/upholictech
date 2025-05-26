import { useEffect, useState } from 'react';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface RawStockData {
  security_id: number;
  LTP: string;
  volume: number;
  open: string;
  close: string;
  high?: string;
  low?: string;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  intradayChangePercent?: number;
}

const symbolMap: { [key: number]: { symbol: string; name: string } } = {
  3499: { symbol: 'TATASTEEL', name: 'Tata Steel' },
  4306: { symbol: 'SHRIRAMFIN', name: 'Shriram Finance' },
  10604: { symbol: 'BHARTIARTL', name: 'Bharti Airtel' },
  1363: { symbol: 'HINDALCO', name: 'Hindalco Industries' },
  13538: { symbol: 'TECHM', name: 'Tech Mahindra' },
  11723: { symbol: 'JSWSTEEL', name: 'JSW Steel' },
  5097: { symbol: 'ETERNAL', name: 'Eternal' },
  25: { symbol: 'ADANIENT', name: 'Adani Enterprises' },
  2475: { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation' },
  1594: { symbol: 'INFY', name: 'Infosys' },
  2031: { symbol: 'M&M', name: 'Mahindra & Mahindra' },
  16669: { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto' },
  1964: { symbol: 'TRENT', name: 'Trent' },
  11483: { symbol: 'LT', name: 'Larsen & Toubro' },
  1232: { symbol: 'GRASIM', name: 'Grasim Industries' },
  7229: { symbol: 'HCLTECH', name: 'HCL Technologies' },
  2885: { symbol: 'RELIANCE', name: 'Reliance Industries' },
  16675: { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv' },
  11536: { symbol: 'TCS', name: 'Tata Consultancy Services' },
  10999: { symbol: 'MARUTI', name: 'Maruti Suzuki' },
  18143: { symbol: 'JIOFIN', name: 'Jio Financial Services' },
  3432: { symbol: 'TATACONSUM', name: 'Tata Consumer Products' },
  3506: { symbol: 'TITAN', name: 'Titan' },
  467: { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance' },
  910: { symbol: 'EICHERMOT', name: 'Eicher Motors' },
  3787: { symbol: 'WIPRO', name: 'Wipro' },
  15083: { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ' },
  21808: { symbol: 'SBILIFE', name: 'SBI Life Insurance' },
  1660: { symbol: 'ITC', name: 'ITC' },
  3045: { symbol: 'SBIN', name: 'State Bank of India' },
  157: { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals' },
  881: { symbol: 'DRREDDY', name: 'Dr Reddys Laboratories' },
  4963: { symbol: 'ICICIBANK', name: 'ICICI Bank' },
  383: { symbol: 'BEL', name: 'Bharat Electronics' },
  317: { symbol: 'BAJFINANCE', name: 'Bajaj Finance' },
  11532: { symbol: 'ULTRACEMCO', name: 'UltraTech Cement' },
  11630: { symbol: 'NTPC', name: 'NTPC' },
  3351: { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical' },
  14977: { symbol: 'POWERGRID', name: 'Power Grid Corporation of India' },
  1922: { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank' },
  5258: { symbol: 'INDUSINDBK', name: 'Indusind Bank' },
  5900: { symbol: 'AXISBANK', name: 'Axis Bank' },
  17963: { symbol: 'NESTLEIND', name: 'Nestle' },
  1394: { symbol: 'HINDUNILVR', name: 'Hindustan Unilever' },
  1333: { symbol: 'HDFCBANK', name: 'HDFC Bank' },
  1348: { symbol: 'HEROMOTOCO', name: 'Hero Motocorp' },
  694: { symbol: 'CIPLA', name: 'Cipla' },
  236: { symbol: 'ASIANPAINT', name: 'Asian Paints' },
  3456: { symbol: 'TATAMOTORS', name: 'Tata Motors' },
};

const PriceScroll = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStocks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stocks');
      const rawData: RawStockData[] = await response.json();

      const newStocks: StockData[] = rawData
        .filter(stock => symbolMap[stock.security_id])
        .map(stock => {
          const { symbol, name } = symbolMap[stock.security_id];
          const currentPrice = parseFloat(stock.LTP);
          const previousClose = parseFloat(stock.close);
          const openPrice = parseFloat(stock.open);

          // Calculate percentage changes
          const changePercent = ((currentPrice - previousClose) / previousClose) * 100;
          const intradayChangePercent = ((currentPrice - openPrice) / openPrice) * 100;

          return {
            symbol,
            name,
            price: currentPrice,
            changePercent,
            intradayChangePercent,
            volume: stock.volume
          };
        });

      setStocks(newStocks);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const intervalId = setInterval(fetchStocks, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const SCROLL_SPEED = 3;
    const scrollInterval = setInterval(() => {
      setScrollPosition(prev => (prev <= -100 * stocks.length ? 0 : prev - SCROLL_SPEED));
    }, 16);

    return () => clearInterval(scrollInterval);
  }, [stocks.length]);

  if (isLoading) {
    return (
      <div className="w-full sticky z-20 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden py-3 border-y border-gray-700 shadow-lg">
        <div className="flex justify-center items-center h-16">
          <span className="text-white">Loading market data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sticky z-20 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden py-3 border-y border-gray-700 shadow-lg">
      <div
        className="flex whitespace-nowrap items-center"
        style={{ transform: `translateX(${scrollPosition}px)` }}
      >
        <div className="flex items-center mx-6">
          <div className="relative">
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-white text-sm tracking-wider">LIVE</span>
          </div>
        </div>

        {stocks.map((stock, index) => (
          <motion.div
            key={`${stock.symbol}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center px-5 mx-3 py-2 bg-gray-800 rounded-xl shadow-md border border-gray-700 hover:border-gray-600 transition-all"
          >
            <div className="flex flex-col min-w-[140px]">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">{stock.symbol}</span>
                {stock.changePercent >= 0 ? (
                  <FiArrowUpRight className="text-green-400 text-sm" />
                ) : (
                  <FiArrowDownRight className="text-red-400 text-sm" />
                )}
              </div>
              <span className="text-xs text-gray-400 truncate">{stock.name}</span>
            </div>

            <div className="flex flex-col items-end ml-4">
              <span className={`font-medium ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <div className="flex items-center">
                <span className={`text-xs font-medium ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
                <span className="text-xs text-gray-400 ml-2">• Vol: {stock.volume.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-gray-900 to-transparent z-10"></div>
    </div>
  );
};

export default PriceScroll;