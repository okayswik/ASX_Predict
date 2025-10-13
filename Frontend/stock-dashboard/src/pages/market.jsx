import React, { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, Globe } from "lucide-react";

const Market = () => {
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const API_KEY = '3CK6MPS1HMO1QGFQ';
    const asxSymbols = ['CBA.AX', 'BHP.AX', 'CSL.AX', 'WBC.AX', 'ANZ.AX', 'NAB.AX', 'TLS.AX', 'WES.AX', 'RIO.AX', 'TCL.AX'];

    // Helper functions
    const getCompanyName = (symbol) => {
        const names = {
            'CBA': 'Commonwealth Bank',
            'BHP': 'BHP Group Limited',
            'CSL': 'CSL Limited',
            'WBC': 'Westpac Banking Corp',
            'ANZ': 'ANZ Group Holdings',
            'NAB': 'National Australia Bank',
            'TLS': 'Telstra Corporation',
            'WES': 'Wesfarmers Limited',
            'RIO': 'Rio Tinto Limited',
            'TCL': 'Transurban Group'
        };
        return names[symbol] || symbol;
    };

    const getSector = (symbol) => {
        const sectors = {
            'CBA': 'Financial',
            'BHP': 'Mining',
            'CSL': 'Healthcare',
            'WBC': 'Financial',
            'ANZ': 'Financial',
            'NAB': 'Financial',
            'TLS': 'Telecom',
            'WES': 'Retail',
            'RIO': 'Mining',
            'TCL': 'Infrastructure'
        };
        return sectors[symbol] || 'Other';
    };

    const getSectorColor = (symbol) => {
        const colors = {
            'Financial': 'bg-purple-100 text-purple-800',
            'Mining': 'bg-yellow-100 text-yellow-800',
            'Healthcare': 'bg-green-100 text-green-800',
            'Telecom': 'bg-indigo-100 text-indigo-800',
            'Retail': 'bg-pink-100 text-pink-800',
            'Infrastructure': 'bg-orange-100 text-orange-800',
            'Index': 'bg-blue-100 text-blue-800'
        };
        return colors[getSector(symbol)] || 'bg-gray-100 text-gray-800';
    };

    const formatVolume = (volume) => {
        if (isNaN(volume) || volume === null || volume === undefined) {
            return 'N/A';
        }
        if (volume >= 1000000) {
            return (volume / 1000000).toFixed(1) + 'M';
        }
        if (volume >= 1000) {
            return (volume / 1000).toFixed(1) + 'K';
        }
        return volume.toString();
    };

    const getSampleData = () => [
        { symbol: 'ASX 200', name: 'S&P/ASX 200', price: 7842.5, change: 45.3, changePercent: 0.58, volume: '2.4B', sector: 'Index', sectorColor: 'bg-blue-100 text-blue-800' },
        { symbol: 'CBA', name: 'Commonwealth Bank', price: 110.25, change: -1.25, changePercent: -1.12, volume: '8.2M', sector: 'Financial', sectorColor: 'bg-purple-100 text-purple-800' },
        { symbol: 'BHP', name: 'BHP Group Limited', price: 42.8, change: 0.95, changePercent: 2.27, volume: '12.5M', sector: 'Mining', sectorColor: 'bg-yellow-100 text-yellow-800' },
        { symbol: 'CSL', name: 'CSL Limited', price: 268.5, change: 5.2, changePercent: 1.97, volume: '1.8M', sector: 'Healthcare', sectorColor: 'bg-green-100 text-green-800' },
        { symbol: 'WBC', name: 'Westpac Banking Corp', price: 56.75, change: -0.45, changePercent: -0.79, volume: '3.1M', sector: 'Financial', sectorColor: 'bg-purple-100 text-purple-800' },
        { symbol: 'ANZ', name: 'ANZ Group Holdings', price: 28.45, change: 0.32, changePercent: 1.14, volume: '4.5M', sector: 'Financial', sectorColor: 'bg-purple-100 text-purple-800' },
        { symbol: 'NAB', name: 'National Australia Bank', price: 35.20, change: -0.15, changePercent: -0.42, volume: '6.1M', sector: 'Financial', sectorColor: 'bg-purple-100 text-purple-800' },
        { symbol: 'TLS', name: 'Telstra Corporation', price: 3.85, change: 0.02, changePercent: 0.52, volume: '15.6M', sector: 'Telecom', sectorColor: 'bg-indigo-100 text-indigo-800' },
        { symbol: 'WES', name: 'Wesfarmers Limited', price: 56.30, change: 1.20, changePercent: 2.18, volume: '2.8M', sector: 'Retail', sectorColor: 'bg-pink-100 text-pink-800' },
        { symbol: 'RIO', name: 'Rio Tinto Limited', price: 115.40, change: -2.10, changePercent: -1.79, volume: '5.2M', sector: 'Mining', sectorColor: 'bg-yellow-100 text-yellow-800' },
        { symbol: 'TCL', name: 'Transurban Group', price: 12.85, change: 0.25, changePercent: 1.98, volume: '7.3M', sector: 'Infrastructure', sectorColor: 'bg-orange-100 text-orange-800' }
    ];

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                console.log('Fetching top gainers/losers data...');
                setLoading(true);
                
                // First, try to get real-time top gainers/losers data
                try {
                    const response = await fetch(
                        `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
                    );
                    const data = await response.json();
                    
                    console.log('Top gainers/losers response:', data);
                    
                    if (data.top_gainers && data.top_gainers.length > 0) {
                        // Process the top gainers data
                        const processedStocks = [];
                        
                        // Add ASX 200 index as first entry
                        processedStocks.push({
                            symbol: 'ASX 200',
                            name: 'S&P/ASX 200',
                            price: 7842.50,
                            change: 45.30,
                            changePercent: 0.58,
                            volume: '2.4B',
                            sector: 'Index',
                            sectorColor: 'bg-blue-100 text-blue-800'
                        });
                        
                        // Add top gainers (filter for reasonable prices and names)
                        const topGainers = data.top_gainers
                            .filter(stock => {
                                const price = parseFloat(stock.price);
                                const changePercent = parseFloat(stock.change_percentage.replace('%', ''));
                                return price > 1 && price < 1000 && changePercent > 0 && changePercent < 50;
                            })
                            .slice(0, 8)
                            .map(stock => ({
                                symbol: stock.ticker,
                                name: stock.ticker, // Use ticker as name since company names aren't provided
                                price: parseFloat(stock.price),
                                change: parseFloat(stock.change_amount),
                                changePercent: parseFloat(stock.change_percentage.replace('%', '')),
                                volume: formatVolume(parseInt(stock.volume) || 0),
                                sector: 'Stock',
                                sectorColor: 'bg-green-100 text-green-800'
                            }));
                        
                        // Add some top losers for variety
                        const topLosers = data.top_losers
                            .filter(stock => {
                                const price = parseFloat(stock.price);
                                const changePercent = parseFloat(stock.change_percentage.replace('%', ''));
                                return price > 1 && price < 1000 && Math.abs(changePercent) < 50;
                            })
                            .slice(0, 3)
                            .map(stock => ({
                                symbol: stock.ticker,
                                name: stock.ticker,
                                price: parseFloat(stock.price),
                                change: parseFloat(stock.change_amount),
                                changePercent: parseFloat(stock.change_percentage.replace('%', '')),
                                volume: formatVolume(parseInt(stock.volume) || 0),
                                sector: 'Stock',
                                sectorColor: 'bg-red-100 text-red-800'
                            }));
                        
                        processedStocks.push(...topGainers, ...topLosers);
                        
                        setStockData(processedStocks);
                        setLoading(false);
                        console.log('Successfully loaded top gainers/losers:', processedStocks);
                        return;
                    }
                } catch (apiError) {
                    console.error('Top gainers/losers API failed:', apiError);
                }
                
                // Fallback: Try to fetch specific ASX stocks with better data
                console.log('Falling back to ASX stock data...');
                const asxStocks = ['CBA.AX', 'BHP.AX', 'CSL.AX', 'WBC.AX', 'ANZ.AX', 'NAB.AX', 'TLS.AX', 'WES.AX', 'RIO.AX'];
                const promises = asxStocks.slice(0, 5).map(async (symbol, index) => {
                    try {
                        // Add delay to respect rate limits
                        await new Promise(resolve => setTimeout(resolve, index * 300));
                        
                        const response = await fetch(
                            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
                        );
                        const data = await response.json();
                        
                        if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
                            const quote = data['Global Quote'];
                            return {
                                symbol: symbol.replace('.AX', ''),
                                name: getCompanyName(symbol.replace('.AX', '')),
                                price: parseFloat(quote['05. price']) || 0,
                                change: parseFloat(quote['09. change']) || 0,
                                changePercent: parseFloat(quote['10. change percent'].replace('%', '')) || 0,
                                volume: formatVolume(parseInt(quote['06. volume']) || 0),
                                sector: getSector(symbol.replace('.AX', '')),
                                sectorColor: getSectorColor(symbol.replace('.AX', ''))
                            };
                        }
                        return null;
                    } catch (error) {
                        console.error(`Error fetching ${symbol}:`, error);
                        return null;
                    }
                });
                
                const results = await Promise.all(promises);
                const validData = results.filter(item => item !== null);
                
                // Add ASX 200 index
                const indexData = {
                    symbol: 'ASX 200',
                    name: 'S&P/ASX 200',
                    price: 7842.50,
                    change: 45.30,
                    changePercent: 0.58,
                    volume: '2.4B',
                    sector: 'Index',
                    sectorColor: 'bg-blue-100 text-blue-800'
                };
                
                if (validData.length > 0) {
                    setStockData([indexData, ...validData]);
                } else {
                    // Final fallback to sample data
                    console.log('Using enhanced sample data with realistic market data...');
                    setStockData(getEnhancedSampleData());
                }
                
                setLoading(false);
                
            } catch (error) {
                console.error('Error in fetchStockData:', error);
                setStockData(getEnhancedSampleData());
                setLoading(false);
            }
        };

        fetchStockData();
    }, []);

    // Market data for the overview cards
    const marketData = {
        asx200: {
            value: 7842.50,
            change: 45.30,
            changePercent: 0.58,
            volume: '2.4B'
        },
        marketStatus: {
            status: 'Market Open',
            tradingHours: '10:00 AM - 4:00 PM',
            nextClose: '2 hours 15 minutes'
        },
        highlights: {
            stocksUp: 234,
            stocksDown: 156,
            unchanged: 52
        }
    };

    const sectorData = [
        { name: 'Financial', stocks: 12, change: 0.45 },
        { name: 'Mining', stocks: 8, change: 1.23 },
        { name: 'Healthcare', stocks: 6, change: -0.33 },
        { name: 'Technology', stocks: 15, change: 2.11 },
        { name: 'Energy', stocks: 9, change: 0.78 },
        { name: 'Retail', stocks: 7, change: -0.56 }
    ];

    const formatCurrency = (price) => {
        return `$${price.toFixed(2)}`;
    };

    // Filter stocks based on search term
    const filteredStockData = stockData.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 md:mb-8">
                <div className="mb-4 lg:mb-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Markets Overview</h1>
                    <p className="text-sm md:text-base text-gray-600">Real-time Australian stock market data</p>
                </div>
                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5"/>
                    <input
                        type="text"
                        placeholder="Search stocks or symbols..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Top Section - ASX 200, Market Status, Today's Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* ASX 200 Index */}
                <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
                    <div className="flex items-center mb-4">
                        <Globe className="w-5 h-5 md:w-6 md:h-6 text-gray-600 mr-2"/>
                        <h3 className="text-sm md:text-base font-medium text-gray-900">ASX 200 Index</h3>
                    </div>
                    <div className="mb-4">
                        <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            {marketData.asx200.value.toLocaleString()}
                        </div>
                        <div className="flex items-center text-green-500 text-sm">
                            <span className="mr-1">↗</span>
                            <span>+{marketData.asx200.change} (+{marketData.asx200.changePercent}%)</span>
                        </div>
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                        Volume: {marketData.asx200.volume}
                    </div>
                </div>

                {/* Market Status */}
                <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
                    <h3 className="text-sm md:text-base font-medium text-gray-900 mb-4">Market Status</h3>
                    <div className="space-y-3">
                        <div className="text-green-600 font-medium text-sm">
                            {marketData.marketStatus.status}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 space-y-1">
                            <div>Trading Hours: {marketData.marketStatus.tradingHours}</div>
                            <div>Next Close: {marketData.marketStatus.nextClose}</div>
                        </div>
                    </div>
                </div>

                {/* Today's Highlights */}
                <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 md:col-span-2 lg:col-span-1">
                    <h3 className="text-sm md:text-base font-medium text-gray-900 mb-4">Today's Highlights</h3>
                    <div className="space-y-2 text-xs md:text-sm">
                        <div className="text-green-600">+{marketData.highlights.stocksUp} stocks up</div>
                        <div className="text-red-600">-{marketData.highlights.stocksDown} stocks down</div>
                        <div className="text-gray-600">{marketData.highlights.unchanged} unchanged</div>
                    </div>
                </div>
            </div>

            {/* Sector Performance */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 md:mb-8">
                <div className="p-4 md:p-6 border-b border-gray-200">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">Sector Performance</h2>
                </div>
                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-x-8 md:gap-y-6">
                        {sectorData.map((sector) => (
                            <div key={sector.name} className="flex justify-between items-center p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none">
                                <div>
                                    <div className="text-sm md:text-base font-medium text-gray-900">{sector.name}</div>
                                    <div className="text-xs md:text-sm text-gray-600">{sector.stocks} stocks</div>
                                </div>
                                <div className={`font-semibold text-sm ${sector.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Stocks */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 md:p-6 border-b border-gray-200">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">Top Stocks</h2>
                </div>
                
                {/* Mobile Card View */}
                <div className="md:hidden">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                                Loading real-time data...
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredStockData.map((stock, index) => (
                                <div key={stock.symbol} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900">{stock.symbol}</div>
                                            <div className="text-sm text-gray-600 truncate pr-2">{stock.name}</div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="font-semibold text-gray-900">{formatCurrency(stock.price)}</div>
                                            <div className={`text-sm flex items-center justify-end ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                <span className="mr-1">
                                                    {stock.change >= 0 ? '↗' : '↘'}
                                                </span>
                                                <span>
                                                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>Vol: {stock.volume}</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stock.sectorColor}`}>
                                            {stock.sector}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {filteredStockData.length === 0 && (
                                <div className="p-6 text-center text-gray-500">
                                    No stocks found matching "{searchTerm}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr className="border-b border-gray-200">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                                            Loading real-time data...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStockData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No stocks found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                filteredStockData.map((stock, index) => (
                                    <tr key={stock.symbol} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {stock.symbol}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {stock.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(stock.price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className={`flex items-center ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                <span className="mr-1">
                                                    {stock.change >= 0 ? '↗' : '↘'}
                                                </span>
                                                <span>
                                                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {stock.volume}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stock.sectorColor}`}>
                                                {stock.sector}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Market;