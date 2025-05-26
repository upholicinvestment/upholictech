import { useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiThumbsUp, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ApexCharts from 'react-apexcharts';

type Stock = {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    sector: string;
    recommendation?: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell';
    confidence?: 'High' | 'Medium' | 'Low';
  };
  
const FNOChart = ({ symbol, data }: { symbol: string; data: any }) => {
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      height: '100%',
      zoom: { enabled: false },
      toolbar: { show: false },
      foreColor: '#9CA3AF'
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: data.categories,
      labels: { style: { colors: '#9CA3AF' } }
    },
    yaxis: {
      title: { text: 'Price (₹)', style: { color: '#9CA3AF' } },
      labels: {
        formatter: (value: number) => value.toFixed(0),
        style: { colors: '#9CA3AF' }
      }
    },
    title: {
      text: `${symbol} Futures & Options`,
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#F3F4F6'
      }
    },
    legend: {
      position: 'top',
      labels: { colors: '#9CA3AF' }
    },
    colors: ['#3B82F6', '#10B981', '#EF4444'],
    grid: {
      borderColor: '#374151',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (value: number) => `₹${value.toFixed(2)}`
      }
    }
  };

  return (
    <div className="h-full">
      <ApexCharts 
        options={chartOptions} 
        series={data.series} 
        type="line" 
        height="100%"
      />
    </div>
  );
};

const FNO_stock = () => {
  const [activeTab, setActiveTab] = useState<'hot' | 'losers' | 'recommended'>('hot');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // Stock data
  const stockData: { [key in 'hot' | 'losers' | 'recommended']: Stock[] } = {
    hot: [
      { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2856.15, change: 45.25, changePercent: 2.45, sector: 'Energy' } as Stock,
      { symbol: 'TCS', name: 'Tata Consultancy', price: 3421.80, change: 32.50, changePercent: 1.89, sector: 'IT' } as Stock,
      { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1567.30, change: 14.25, changePercent: 0.92, sector: 'Banking' } as Stock,
      { symbol: 'INFY', name: 'Infosys', price: 1498.50, change: 18.55, changePercent: 1.25, sector: 'IT' } as Stock,
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 876.45, change: 26.50, changePercent: 3.12, sector: 'Telecom' } as Stock
    ],
    losers: [
      { symbol: 'ADANIPORTS', name: 'Adani Ports', price: 745.60, change: -25.15, changePercent: -3.25, sector: 'Infrastructure' } as Stock,
      { symbol: 'TECHM', name: 'Tech Mahindra', price: 1123.40, change: -32.10, changePercent: -2.78, sector: 'IT' } as Stock,
      { symbol: 'WIPRO', name: 'Wipro', price: 425.15, change: -9.35, changePercent: -2.15, sector: 'IT' } as Stock,
      { symbol: 'ONGC', name: 'Oil & Natural Gas', price: 167.80, change: -3.25, changePercent: -1.92, sector: 'Energy' } as Stock,
      { symbol: 'ITC', name: 'ITC Limited', price: 285.30, change: -4.20, changePercent: -1.45, sector: 'FMCG' } as Stock
    ],
    recommended: [
      { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 3245.60, change: 58.75, changePercent: 1.85, sector: 'Consumer Goods', recommendation: 'Buy', confidence: 'High' },
      { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 7123.40, change: -55.20, changePercent: -0.78, sector: 'Financial', recommendation: 'Hold', confidence: 'Medium' },
      { symbol: 'DIVISLAB', name: 'Divis Labs', price: 3825.15, change: 109.50, changePercent: 2.95, sector: 'Pharmaceutical', recommendation: 'Strong Buy', confidence: 'High' },
      { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2567.80, change: 15.75, changePercent: 0.62, sector: 'FMCG', recommendation: 'Buy', confidence: 'Medium' },
      { symbol: 'SBIN', name: 'State Bank of India', price: 585.30, change: -7.40, changePercent: -1.25, sector: 'Banking', recommendation: 'Sell', confidence: 'Low' }
    ]
  };

  const getConfidenceColor = (confidence?: string) => {
    switch(confidence) {
      case 'High': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRecommendationColor = (recommendation?: string) => {
    switch(recommendation) {
      case 'Strong Buy': return 'bg-green-900 text-green-300';
      case 'Buy': return 'bg-blue-900 text-blue-300';
      case 'Hold': return 'bg-yellow-900 text-yellow-300';
      case 'Sell': return 'bg-red-900 text-red-300';
      default: return 'bg-gray-800 text-gray-300';
    }
  };

  const generateChartData = (stock: Stock) => ({
    series: [
      { name: 'Futures', data: [stock.price * 0.98, stock.price * 0.99, stock.price, stock.price * 1.01, stock.price * 1.02] },
      { name: 'Call Options', data: [stock.price * 0.97, stock.price * 0.98, stock.price * 0.99, stock.price, stock.price * 1.01] },
      { name: 'Put Options', data: [stock.price * 1.03, stock.price * 1.02, stock.price * 1.01, stock.price, stock.price * 0.99] }
    ],
    categories: ['9:30', '11:00', '12:30', '2:00', '3:30']
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900">
      {/* 30% Left Panel - Stock Selection */}
      <div className="w-full md:w-1/3 lg:w-[30%] bg-gray-800 shadow-md rounded-xl m-2 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-gray-100">Stocks</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['hot', 'losers', 'recommended'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === tab 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <div className="flex items-center justify-center gap-2">
                {tab === 'hot' && <FiTrendingUp />}
                {tab === 'losers' && <FiTrendingDown />}
                {tab === 'recommended' && <FiStar />}
                <span className="hidden sm:inline">
                  {tab === 'hot' ? 'Top Gainer' : tab === 'losers' ? 'Top Losers' : 'Recommended'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Stock List */}
        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          {stockData[activeTab].map((stock) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
                selectedStock?.symbol === stock.symbol 
                  ? 'bg-gray-700' 
                  : 'hover:bg-gray-700'
              }`}
              onClick={() => setSelectedStock(stock)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-100">{stock.symbol}</h3>
                    <span className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded">
                      {stock.sector}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{stock.name}</p>
                  {stock.recommendation && (
                    <span className={`text-xs px-2 py-1 rounded inline-block ${getRecommendationColor(stock.recommendation)}`}>
                      {stock.recommendation}
                    </span>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-gray-100">₹{stock.price.toLocaleString('en-IN')}</p>
                  <p className={`text-sm ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
                  </p>
                  {stock.confidence && (
                    <div className={`text-xs flex items-center justify-end gap-1 ${getConfidenceColor(stock.confidence)}`}>
                      <FiThumbsUp size={12} />
                      {stock.confidence}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 70% Right Panel - F&O Chart */}
      <div className="flex-1 flex flex-col bg-gray-900 rounded-xl m-2 overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <h2 className="text-xl font-bold text-gray-100">
            {selectedStock
              ? `${selectedStock.name} (${selectedStock.symbol}) Futures & Options`
              : 'Select a stock to view F&O data'}
          </h2>
        </div>
        
        <div className="flex-1 p-4 overflow-hidden">
          {selectedStock ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gray-800 rounded-lg p-4"
            >
              <FNOChart 
                symbol={selectedStock.symbol}
                data={generateChartData(selectedStock)}
              />
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
              <p className="text-gray-400">Please select a stock from the left panel</p>
            </div>
          )}
        </div>

        {/* Additional F&O Data */}
        {selectedStock && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 border-t border-gray-700 bg-gray-800"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400">Open Interest</h3>
                <p className="text-lg font-bold text-gray-100">1,24,500</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400">Premium</h3>
                <p className="text-lg font-bold text-gray-100">₹{Math.round(selectedStock.price * 0.05)}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400">Volume</h3>
                <p className="text-lg font-bold text-gray-100">5,42,000</p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400">IV</h3>
                <p className="text-lg font-bold text-gray-100">22.5%</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FNO_stock;