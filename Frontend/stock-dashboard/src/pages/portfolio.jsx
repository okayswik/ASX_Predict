import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Search, X, Edit2, Trash2 } from 'lucide-react';

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 125650.75,
    totalChange: 2450.3,
    totalChangePercent: 1.99,
    positions: []
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    shares: '',
    avgPrice: ''
  });

  // Stock data cache
  const [stockDataCache, setStockDataCache] = useState({});
  const [positionMetrics, setPositionMetrics] = useState({});

  // API Stock endpoints
  const API_KEY = '3CK6MPS1HMO1QGFQ';

  const getStockData = async (symbol) => {
    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
      const data = await response.json();

      const quote = data["Global Quote"];

      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('No data found for symbol');
      }

      return {
        price: parseFloat(quote["05. price"]) || 0,
        change: parseFloat(quote["09. change"]) || 0,
        changePercent: parseFloat(quote["10. change percent"]?.replace('%', '')) || 0,
        name: symbol
      };
    } catch (error) {
      console.error('API Error: ', error);
      // Fallback mock data for testing
      const mockData = {
        'AAPL': { price: 185.25, change: 3.52, changePercent: 1.94, name: 'Apple Inc.' },
        'MSFT': { price: 378.90, change: 4.42, changePercent: 1.18, name: 'Microsoft Corp.' },
        'TSLA': { price: 198.50, change: -2.65, changePercent: -1.32, name: 'Tesla Inc.' },
        'CBA': { price: 110.25, change: 1.85, changePercent: 1.70, name: 'Commonwealth Bank' },
        'BHP': { price: 42.80, change: 0.50, changePercent: 1.18, name: 'BHP Group' },
        'CSL': { price: 268.50, change: 2.30, changePercent: 0.86, name: 'CSL Limited' }
      };
      return mockData[symbol] || { price: 0, change: 0, changePercent: 0, name: symbol };
    }
  };

  // Search function for stocks
  const searchStocks = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${term}&apikey=${API_KEY}`);
      const data = await response.json();

      const results = data.bestMatches?.map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        price: null
      })) || [];

      setSearchResults(results);
    } catch (error) {
      console.error('Search API Error: ', error);
      setSearchResults([]);
    }

    setIsSearching(false);
  };

  // Initialize with sample data (FIXED: removed duplicate)
  useEffect(() => {
    const initialPositions = [
      { id: 1, symbol: 'CBA', shares: 50, avgPrice: 98.5, allocation: 4.4 },
      { id: 2, symbol: 'BHP', shares: 200, avgPrice: 38.75, allocation: 6.8 },
      { id: 3, symbol: 'CSL', shares: 25, avgPrice: 245, allocation: 5.3 },
      { id: 4, symbol: 'AAPL', shares: 100, avgPrice: 150, allocation: 14.7 },
      { id: 5, symbol: 'MSFT', shares: 75, avgPrice: 320, allocation: 22.6 },
      { id: 6, symbol: 'TSLA', shares: 30, avgPrice: 225, allocation: 4.7 }
    ];

    setPortfolioData(prev => ({
      ...prev,
      positions: initialPositions
    }));
  }, []);

  // Load stock data for all positions
  useEffect(() => {
    const loadPositionMetrics = async () => {
      const metrics = {};
      
      for (const position of portfolioData.positions) {
        const stockData = await getCachedStockData(position.symbol);
        const currentValue = position.shares * stockData.price;
        const costBasis = position.shares * position.avgPrice;
        const gain = currentValue - costBasis;
        const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0;

        metrics[position.id] = {
          stockData,
          currentValue,
          gain,
          gainPercent
        };
      }

      setPositionMetrics(metrics);
    };

    if (portfolioData.positions.length > 0) {
      loadPositionMetrics();
    }
  }, [portfolioData.positions]);

  // Portfolio management functions
  const addPosition = () => {
    if (!newPosition.symbol || !newPosition.shares || !newPosition.avgPrice) return;

    const newId = Math.max(...portfolioData.positions.map(p => p.id), 0) + 1;
    const position = {
      id: newId,
      symbol: newPosition.symbol.toUpperCase(),
      shares: parseInt(newPosition.shares),
      avgPrice: parseFloat(newPosition.avgPrice),
      allocation: 5.0
    };

    setPortfolioData(prev => ({
      ...prev,
      positions: [...prev.positions, position]
    }));

    setNewPosition({ symbol: '', shares: '', avgPrice: '' });
    setShowAddModal(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const editPosition = (position) => {
    setEditingPosition(position);
    setNewPosition({
      symbol: position.symbol,
      shares: position.shares.toString(),
      avgPrice: position.avgPrice.toString()
    });
    setShowEditModal(true);
  };

  const updatePosition = () => {
    if (!newPosition.symbol || !newPosition.shares || !newPosition.avgPrice) return;

    setPortfolioData(prev => ({
      ...prev,
      positions: prev.positions.map(p =>
        p.id === editingPosition.id
          ? {
              ...p,
              symbol: newPosition.symbol.toUpperCase(),
              shares: parseInt(newPosition.shares),
              avgPrice: parseFloat(newPosition.avgPrice)
            }
          : p
      )
    }));

    setShowEditModal(false);
    setEditingPosition(null);
    setNewPosition({ symbol: '', shares: '', avgPrice: '' });
  };

  const deletePosition = (id) => {
    setPortfolioData(prev => ({
      ...prev,
      positions: prev.positions.filter(p => p.id !== id)
    }));
  };

  const getCachedStockData = async (symbol) => {
    const cached = stockDataCache[symbol];
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    if (cached && cached.timestamp > fiveMinutesAgo) {
      return cached.data;
    }

    const data = await getStockData(symbol);
    setStockDataCache(prev => ({
      ...prev,
      [symbol]: {
        data,
        timestamp: Date.now()
      }
    }));

    return data;
  };

  // Calculate best and worst performers
  const bestPerformer = portfolioData.positions.reduce((best, position) => {
    const metrics = positionMetrics[position.id];
    const bestMetrics = positionMetrics[best?.id];
    
    if (!metrics) return best;
    if (!best || !bestMetrics) return position;
    
    return metrics.gainPercent > bestMetrics.gainPercent ? position : best;
  }, null);

  const worstPerformer = portfolioData.positions.reduce((worst, position) => {
    const metrics = positionMetrics[position.id];
    const worstMetrics = positionMetrics[worst?.id];
    
    if (!metrics) return worst;
    if (!worst || !worstMetrics) return position;
    
    return metrics.gainPercent < worstMetrics.gainPercent ? position : worst;
  }, null);

  const performancePeriods = [
    { period: '1D', change: 1.99 },
    { period: '1W', change: 3.45 },
    { period: '1M', change: 8.12 },
    { period: '3M', change: 15.67 },
    { period: '6M', change: 22.34 },
    { period: '1Y', change: 34.89 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-600 mt-1">Track your investment performance</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Position
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Total Value</span>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${portfolioData.totalValue.toLocaleString()}
            </div>
            <div className={`flex items-center text-sm ${portfolioData.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioData.totalChange >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
              +${portfolioData.totalChange.toLocaleString()} (+{portfolioData.totalChangePercent}%)
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Total Positions</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {portfolioData.positions.length}
            </div>
            <div className="text-sm text-gray-500">
              Across multiple markets
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Best Performer</span>
              <span className="text-2xl">🚀</span>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1">
              {bestPerformer ? bestPerformer.symbol : 'N/A'}
            </div>
            <div className="text-sm text-green-600">
              {bestPerformer && positionMetrics[bestPerformer.id] 
                ? `+${positionMetrics[bestPerformer.id].gainPercent.toFixed(2)}%` 
                : 'N/A'}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Worst Performer</span>
              <span className="text-2xl">📉</span>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1">
              {worstPerformer ? worstPerformer.symbol : 'N/A'}
            </div>
            <div className="text-sm text-red-600">
              {worstPerformer && positionMetrics[worstPerformer.id]
                ? `${positionMetrics[worstPerformer.id].gainPercent.toFixed(2)}%`
                : 'N/A'}
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Performance Overview</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {performancePeriods.map((period) => (
              <div key={period.period} className="text-center">
                <div className="text-sm text-gray-500 mb-1">{period.period}</div>
                <div className={`text-lg font-semibold ${period.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {period.change >= 0 ? '+' : ''}{period.change}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Holdings
            </h2>
          </div>

          <div className="overflow-x-auto">
            {portfolioData.positions.map((position) => {
              const metrics = positionMetrics[position.id] || {
                stockData: { price: 0, name: position.symbol },
                currentValue: 0,
                gain: 0,
                gainPercent: 0
              };

              return (
                <div key={position.id} className="p-4 md:p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Stock Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between lg:justify-start lg:gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-gray-900">{position.symbol}</span>
                            <span className="text-sm text-gray-500 hidden sm:inline">
                              {metrics.stockData.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {position.shares} shares @ ${position.avgPrice.toFixed(2)} avg
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 lg:hidden">
                          {position.allocation}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(position.allocation * 4, 100)}%` }}
                        ></div>
                      </div>

                      <div className="hidden lg:block text-sm font-medium text-gray-600">
                        {position.allocation}%
                      </div>
                    </div>

                    {/* Values */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-8 text-right">
                      <div>
                        <div className="text-sm text-gray-500">Current Value</div>
                        <div className="font-semibold text-gray-900">
                          ${metrics.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500">Current Price</div>
                        <div className="font-semibold text-gray-900">
                          ${metrics.stockData.price.toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500">Gain/Loss</div>
                        <div className={`font-semibold ${metrics.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.gain >= 0 ? '+' : ''}${Math.abs(metrics.gain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <div className="text-sm">
                            {metrics.gain >= 0 ? '+' : ''}{metrics.gainPercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editPosition(position)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deletePosition(position.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Position</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewPosition({ symbol: '', shares: '', avgPrice: '' });
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Stock Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Stock
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      searchStocks(e.target.value);
                    }}
                    placeholder="Search by symbol or name..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search size={20} className="absolute right-3 top-2.5 text-gray-400" />
                  {isSearching && (
                    <div className="absolute right-10 top-2.5">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    {searchResults.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => {
                          setNewPosition(prev => ({ ...prev, symbol: stock.symbol }));
                          setSearchTerm('');
                          setSearchResults([]);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-sm text-gray-600">{stock.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual Symbol Entry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  value={newPosition.symbol}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  placeholder="e.g., AAPL"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Shares
                </label>
                <input
                  type="number"
                  value={newPosition.shares}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, shares: e.target.value }))}
                  placeholder="100"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPosition.avgPrice}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, avgPrice: e.target.value }))}
                  placeholder="150.00"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewPosition({ symbol: '', shares: '', avgPrice: '' });
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addPosition}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Position
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Position Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Position</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPosition(null);
                  setNewPosition({ symbol: '', shares: '', avgPrice: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  value={newPosition.symbol}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Shares
                </label>
                <input
                  type="number"
                  value={newPosition.shares}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, shares: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPosition.avgPrice}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, avgPrice: e.target.value }))}
                  placeholder="150.00"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPosition(null);
                  setNewPosition({ symbol: '', shares: '', avgPrice: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updatePosition}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Position
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;