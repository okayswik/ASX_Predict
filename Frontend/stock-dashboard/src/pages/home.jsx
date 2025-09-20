import React, {useState, useEffect} from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Search, RefreshCw, X } from 'lucide-react';

export default function Home(){  // Changed from StockDashboard to Home
    const [searchSymbol, setSearchSymbol] = useState('AAPL');
    const [sentimentText, setSentimentText] = useState('');
    const [stockData, setStockData] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [dailyChange, setDailyChange] = useState(0);
    const [changePercent, setChangePercent] = useState(0);
    const [volume, setVolume] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    //Alpha Vantage API key (free tier)
    const API_KEY = '3CK6MPS1HMO1QGFQ'; 

    const fetchStockData = async (symbol) => {
        setLoading(true);
        setError('');
        
        try {
            // Fetch intraday data for chart 
            const intradayResponse = await fetch(
                `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`
            );
            const intradayData = await intradayResponse.json();
            
            // Fetch daily data for metrics
            const dailyResponse = await fetch(
                `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
            );
            const dailyData = await dailyResponse.json();

            if (intradayData['Error Message'] || dailyData['Error Message']) {
                throw new Error('Invalid symbol or API limit reached');
            }
            
            // Process intraday data for chart
            const timeSeries = intradayData['Time Series (5min)'];
            if (timeSeries) {
                const chartData = Object.entries(timeSeries)
                    .slice(0, 20)
                    .reverse()
                    .map(([time, data]) => ({
                        time: time.split(' ')[1].substring(0, 5),
                        price: parseFloat(data['4. close'])
                    }));
                setStockData(chartData);
                setCurrentPrice(chartData[chartData.length - 1]?.price || 0);
            }

            // Process daily data for metrics
            const dailySeries = dailyData['Time Series (Daily)'];
            if (dailySeries) {
                const dates = Object.keys(dailySeries).slice(0, 2);
                const today = dailySeries[dates[0]];
                const yesterday = dailySeries[dates[1]];

                const todayClose = parseFloat(today['4. close']);
                const yesterdayClose = parseFloat(yesterday['4. close']);
                const change = todayClose - yesterdayClose;
                const percent = (change / yesterdayClose) * 100;

                setCurrentPrice(todayClose);
                setDailyChange(change);
                setChangePercent(percent);
                setVolume(parseInt(today['5. volume']));
            }
        }
        catch (err) {
            setError(err.message || 'Failed to fetch stock data');
            console.error('API Error:', err);

            // Fallback to demo data if API fails
            const demoData = [
                {time: '09:30', price: 185.2},
                { time: '10:00', price: 186.8 },
                { time: '10:30', price: 187.2 },
                { time: '11:00', price: 186.5 },
                { time: '11:30', price: 188.9 },
                { time: '12:00', price: 189.8 },
                { time: '12:30', price: 190.1 },
                { time: '13:00', price: 189.2 },
                { time: '13:30', price: 191.5 },
            ];
            setStockData(demoData);
            setCurrentPrice(189.45);
            setDailyChange(4.32);
            setChangePercent(2.34);
            setVolume(45200000);
        }
        finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (searchSymbol.trim()) {
            fetchStockData(searchSymbol.toUpperCase());
        }
    };

    // ADD THIS MISSING FUNCTION
    const handleRefresh = () => {
        if (searchSymbol.trim()) {
            fetchStockData(searchSymbol.toUpperCase());
        }
    };

    // Add useEffect to load initial data
    useEffect(() => {
        fetchStockData('AAPL');
    }, []);

    const formatVolume = (vol) => {
        if (vol >= 1000000){
            return `${(vol/1000000).toFixed(1)}M`;
        }
        else if (vol>=1000){
            return `${(vol / 1000).toFixed(1)}K`;
        }
        return vol.toString();
    }

    return(
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Stock Price Chart Selection */}
            <div className="bg-white rounded-xl shadow sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Stock Price Chart</h2>

                <div className="flex items-center mb-6">
                    <input
                        type="text"
                        value={searchSymbol}
                        onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                        className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-lg font-medium"
                        placeholder="Enter stock symbol (eg. AAPL, GOOGL, TSLA)..."
                        disabled={loading}
                    />
                    <button
                        onClick={handleRefresh}  // This function was missing!
                        disabled={loading}
                        className="ml-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                        <p className="text-red-500 text-xs mt-1">Showing demo data instead. Get a free API key from Alpha Vantage to use live data.</p>
                    </div>
                )}

                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{searchSymbol} Stock Price</h3>
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Chart */}
                <div className="h-80 mb-6">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2"/>
                                <p className="text-gray-600">Loading stock data...</p>
                            </div>
                        </div>
                    ): stockData.length > 0 ? (
                        <ResponsiveContainer width ="100%" height = "100%">
                            <LineChart data = {stockData}>
                                <XAxis
                                    dataKey = "time"
                                    axisLine = {false}
                                    tickLine = {false}
                                    tick = {{ fontSize: 12, fill: "#6B7280"}}
                                />
                                <YAxis
                                    axisLine = {false}
                                    tickLine = {false}
                                    tick = {{ fontSize: 12, fill: '#6B7280'}}
                                    domain = {['dataMin - 1', 'dataMax + 1']}
                                />
                                <Line
                                    type = "monotone"
                                    dataKey = "price"
                                    stroke = "#6366F1"
                                    strokeWidth = {2}
                                    dot = {false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-500">No data available</p>
                        </div>
                    )}
                </div>

                {/* Stock Metrics */}
                <div className="grid grid-cols-3 gap-8">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Current Price</p>
                        <p className="text-2xl font-bold text-gray-900">${currentPrice.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Daily Change</p>
                        <p className={`text-2xl font-bold ${changePercent >= 0 ? 'text-green-600': 'text-red-600'}`}>
                            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Volume</p>
                        <p className="text-2xl font-bold text-gray-900">{formatVolume(volume)}</p>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-2 gap-8">
                {/* Sentiment Analysis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
                    <textarea
                        value={sentimentText}
                        onChange={(e) => setSentimentText(e.target.value)}
                        placeholder="Enter news headline or tweet"
                        className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Stock Prediction */}
                <div className = "bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Stock Prediction</h3>
                        <button className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800">
                            <span className="text-sm font-bold">?</span>
                        </button>
                    </div>
                    <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                        Run Prediction
                    </button>
                </div>
            </div>
        </div>
    );
}