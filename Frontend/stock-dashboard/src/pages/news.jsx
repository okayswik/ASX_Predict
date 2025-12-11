import React, {useEffect, useState} from 'react';
import { Search, TrendingUp, Calendar, ExternalLink, Clock, Loader} from 'lucide-react';

const MarketNews = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const NEWS_API_KEY = "743fe0e482144d6084365ccde4a1e38c"; // FIXED: removed spaces

    const categories = ['All', 'Markets', 'Corporate', 'Mining', 'Technology', 'Economy', 'Energy'];

    const trendingTopics = [
        {name: 'Banking', color: 'blue'},
        {name: 'Cryptocurrency', color: 'purple'},
        {name:'RBA policy', color: 'green'}
    ];

    const sentiment = {
        positive: 58,
        neutral: 27,
        negative:17 
    };

    const fetchNews = async(category = "All") => {
        setLoading(true);
        setError(null);

        try{
            const categoryQueries = {
                'All': 'stock market OR finance OR economy',
                'Markets': 'stock market OR trading OR NYSE OR ASX',
                'Corporate': 'corporate earnings OR business news',
                'Mining': 'mining stocks OR commodities OR metals',
                'Technology': 'tech stocks OR technology companies',
                'Economy': 'economy OR GDP OR inflation OR interest rates',
                'Energy': 'energy stocks OR oil prices OR renewable energy'
            };

            const query = categoryQueries[category] || categoryQueries['All'];
            const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`;
      
            console.log('🔍 Fetching news for:', category);
            const response = await fetch(url);

            if (!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'error'){
                throw new Error(data.message || 'Failed to fetch news articles');
            }

            console.log('Fetched', data.articles.length,'articles');

            const transformedArticles = data.articles
                .filter(article => article.title !== '[Removed]')
                .map((article,index) => ({
                    id: article.url || index,
                    category: category === 'All' ? 'Markets' : category,
                    title: article.title,
                    description: article.description || article.content?.substring(0,200) + '...' || 'No description available.', 
                    source: article.source.name,
                    time: formatTimeAgo(article.publishedAt),
                    image: article.urlToImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
                    url: article.url,
                    sentiment: determineSentiment(article.title, article.description),
                    impact: determineImpact(article.title, article.source.name)
                }));
            
            setArticles(transformedArticles);
            setLoading(false);
        }
        catch (err){
            console.error('Error fetching news:', err);
            setError(err.message);
            setLoading(false);
            loadMockData(category);
        }
    };

    const formatTimeAgo = (timeStamp) => {
        const now = new Date();
        const publishedDate = new Date(timeStamp);
        const diffInSeconds = Math.floor((now - publishedDate) / 1000);

        if (diffInSeconds < 60) return "Just Now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return publishedDate.toLocaleDateString();
    };

    const determineSentiment = (title, description) => {
        const text = `${title} ${description}`.toLowerCase();

        const positiveKeywords = ['gain', 'rise', 'surge', 'rally', 'soar', 'jump', 'up', 'boost', 'growth', 'profit'];
        const negativeKeywords = ['fall', 'drop', 'decline', 'crash', 'plunge', 'loss', 'down', 'concern', 'risk'];

        const positiveCount = positiveKeywords.filter(word => text.includes(word)).length;
        const negativeCount = negativeKeywords.filter(word => text.includes(word)).length;

        if(positiveCount > negativeCount) return 'positive';
        if(negativeCount > positiveCount) return 'negative';
        return 'neutral'; 
    };

    const determineImpact = (title, source) => {
        const highImpactSources = ['Reuters', 'Bloomberg', 'Financial Times', 'Wall Street Journal'];
        const highImpactWords = ['federal reserve', 'central bank', 'rate decision', 'gdp', 'inflation'];

        const titleLower = title.toLowerCase();
        const hasHighImpactWord = highImpactWords.some(word => titleLower.includes(word));
        const isHighImpactSource = highImpactSources.some(src => source.includes(src));

        if(hasHighImpactWord || isHighImpactSource) return 'high impact';
        if(Math.random() > 0.5) return 'medium impact';
        return 'low impact';
    };

    const loadMockData = (category) => {
        console.log('🔄 Loading fallback mock data');
        const mockArticles = [
            {
                id: 1,
                category: category === 'All' ? 'Markets' : category,
                title: 'Asian Markets Rally on Strong US Economic Data',
                description: 'Regional indices surged higher following positive economic indicators from the United States, with technology and finance sectors leading gains.',
                source: 'Reuters',
                time: '6 hours ago',
                image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
                url: '#',
                sentiment: 'positive',
                impact: 'high impact'
            },
            {
                id: 2,
                category: category === 'All' ? 'Technology' : category,
                title: 'Tech Stocks Extend Gains as Payment Solutions Surge',
                description: 'Technology stocks extended gains for the third consecutive session as payment solutions demonstrate strong adoption rates.',
                source: 'AFR',
                time: '8 hours ago',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
                url: '#',
                sentiment: 'positive',
                impact: 'medium impact'
            },
            {
                id: 3,
                category: category === 'All' ? 'Economy' : category,
                title: 'Reserve Bank Hints at Potential Rate Changes',
                description: "RBA Governor's latest speech suggests monetary policy adjustments may be considered as inflation data shows mixed signals.",
                source: 'ABC Finance',
                time: '1 day ago',
                image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
                url: '#',
                sentiment: 'neutral',
                impact: 'high impact'
            }
        ];
        setArticles(mockArticles);
    };

    useEffect(() => {
        fetchNews(selectedCategory);
    }, [selectedCategory]);

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        article.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getSentimentColor = (sentiment) => {
        switch(sentiment) {
            case 'positive': return 'text-green-600 bg-green-50'; // FIXED: added bg
            case 'neutral': return 'text-yellow-600 bg-yellow-50';
            case 'negative': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50'; 
        }
    };

    const getImpactColor = (impact) => { // FIXED: spelling
        switch(impact){
            case 'high impact': return "text-red-600 bg-red-50";
            case 'medium impact': return "text-yellow-600 bg-yellow-50";
            case 'low impact': return "text-blue-600 bg-blue-50"; // FIXED: changed to blue
            default: return "text-gray-600 bg-gray-50";
        }
    };

    const getTopicColor = (color) => {
        switch(color) {
            case 'blue': return 'text-blue-700 bg-blue-50 border-blue-200';
            case 'green': return 'text-green-700 bg-green-50 border-green-200';
            case 'red': return 'text-red-700 bg-red-50 border-red-200';
            case 'purple': return 'text-purple-700 bg-purple-50 border-purple-200'; // FIXED: added purple
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
            <div className='max-w-7xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-2'>Market News</h1>
                    <p className='text-gray-600'>Stay updated with the latest financial news and market insights</p>
                </div>

                <div className='mb-6'>
                    <div className='relative'>
                        <input
                            type='text'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='Search news articles...'
                            className='w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                        <Search className='absolute left-4 top-3.5 text-gray-400' size={20}/>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                    <div className='bg-white p-6 rounded-xl shadow-sm'>
                        <div className='flex items-center gap-2 mb-4'>
                            <TrendingUp size={20} className='text-gray-600'/>
                            <h2 className='font-semibold text-gray-900'>Trending Topics</h2>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                            {trendingTopics.map((topic, index) => (
                                <span
                                    key={index}
                                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getTopicColor(topic.color)}`}
                                >
                                    {topic.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className='bg-white p-6 rounded-xl shadow-sm'>
                        <div className='flex items-center gap-2 mb-4'>
                            <Calendar size={20} className='text-gray-600'/>
                            <h2 className='font-semibold text-gray-900'>Today's Articles</h2>
                        </div>
                        <div className='text-4xl font-bold text-gray-900 mb-1'>{articles.length}</div>
                        <div className='text-sm text-gray-600'>Articles loaded</div>
                    </div>

                    <div className='bg-white p-6 rounded-xl shadow-sm'>
                        <h2 className='font-semibold text-gray-900 mb-4'>Market Sentiment</h2>
                        <div className='space-y-2'>
                            <div className='flex justify-between items-center'>
                                <span className='text-green-600 font-medium'>Positive: {sentiment.positive}%</span>
                                <span className='text-gray-500 font-medium'>Neutral: {sentiment.neutral}%</span>
                            </div>
                            <div className='text-red-600 font-medium'>Negative: {sentiment.negative}%</div>
                        </div>
                    </div>
                </div>

                <div className='mb-6 overflow-x-auto'>
                    <div className='flex gap-2 min-w-max pb-2'>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                disabled={loading}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                                    selectedCategory === category 
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'bg-transparent text-gray-600 hover:bg-white hover:shadow-sm'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                            >
                                {category}  
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className='flex flex-col items-center justify-center py-12'>
                        <Loader className='animate-spin text-blue-600 mb-4' size={48}/>
                        <p className='text-gray-600'>Loading latest news....</p>
                    </div>
                )}

                {error && !loading && (
                    <div className='bg-red-50 border border-red-200 rounded-lg p-6 mb-6'> {/* FIXED: border- to border */}
                        <h3 className='text-red-800 font-semibold mb-2'>Error Loading News</h3>
                        <p className='text-red-600 text-sm'>{error}</p>
                        <p className='text-red-600 text-sm mt-2'>Showing fallback data instead.</p>
                    </div>
                )}

                {!loading && (
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {filteredArticles.map((article) => (
                            <div key={article.id} className='bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow'>
                                <div className='relative h-64 bg-gray-200 overflow-hidden'>
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className='w-full h-full object-cover'
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop';
                                        }}
                                    />
                                </div>

                                <div className='p-6'>
                                    <div className='flex flex-wrap gap-2 mb-3'>
                                        <span className='px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
                                            {article.category}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
                                            {article.sentiment}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(article.impact)}`}> {/* FIXED: function name */}
                                            {article.impact}
                                        </span>
                                    </div>

                                    <h3 className='text-xl font-bold text-gray-900 mb-3 line-clamp-2'>
                                        {article.title}
                                    </h3>

                                    <p className='text-gray-600 mb-4 line-clamp-3'>
                                        {article.description}
                                    </p>

                                    <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
                                        <div className='flex items-center gap-4 text-sm text-gray-500'>
                                            <span className='font-medium'>{article.source}</span>
                                            <div className='flex items-center gap-1'>
                                                <Clock size={14}/>
                                                <span>{article.time}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={article.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors'
                                        >
                                            Read More
                                            <ExternalLink size={16}/>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredArticles.length === 0 && (
                    <div className='text-center py-12'>
                        <div className='text-gray-400 mb-4'>
                            <Search size={48} className='mx-auto'/>
                        </div>
                        <h3 className='text-xl font-semibold text-gray-900 mb-2'>No articles found</h3>
                        <p className='text-gray-600'>Try adjusting your search or category filter</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketNews;