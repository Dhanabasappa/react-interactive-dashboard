import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import CryptoFilters from "../components/crypto/CryptoFilters";
import CryptoTable from "../components/crypto/CrytpoTable";
import CryptoStats from "../components/crypto/CryptoStats";
import TopCryptos from "../components/crypto/TopCryptos";
import { useEffect, useState, useRef } from "react";
import AnimatedPage from "../components/AnimatedPage";
import toast from "react-hot-toast";
import { config } from "../config/env";
import { 
  fetchWithRetryAndLimit, 
  cryptoLimiter, 
  createApiInstance 
} from "../utils/apiHelpers"; // ADD THIS
import { errorHandler } from "../utils/errorHandler";
import { TrendingUp, RefreshCw } from "lucide-react";

const Crypto =() => {
    const [coins,setCoins] = useState([]);
    const [filtered,setFiltered] = useState([]);
    const [loading,setLoading] = useState(true);
    const [lastFetch, setLastFetch] = useState(null);
    const abortControllerRef = useRef(null);
    // Create axios instance for CoinGecko
    const coinGeckoApi = createApiInstance(config.coinGeckoApiUrl);

    const fetchCrypto = async(showToast = false) => {
        // Cancel previous request if still pending
        if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        try{
            setLoading(true);
            if (showToast) {
                toast.loading('Fetching crypto data...', { id: 'crypto-fetch' });
            }
            // Use retry logic with rate limiting
            const { data } = await fetchWithRetryAndLimit(
                `${config.coinGeckoApiUrl}/coins/markets`,{
                params:{
                    vs_currency:"usd",
                    order:"market_cap_desc",
                    per_page:50,
                    sparkline:true,
                    price_change_percentage:"1h,24h,7d"
                },
                signal: abortControllerRef.current.signal
            },cryptoLimiter,
            5 // max retries
        );
            
            setCoins(data);
            setFiltered(data);
            setLastFetch(new Date());
            setLoading(false);
            if (showToast) {
                toast.success('Crypto data updated!', { id: 'crypto-fetch' });
            }
        }catch(error){
            if (error.name === 'AbortError') {
                console.log('Request was cancelled');
                return;
            }

            console.error("API error: ", error);
            setLoading(false);

            // Use centralized error handler
            errorHandler(error, toast);

            if (showToast) {
                toast.dismiss('crypto-fetch');
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        };
    }, []);
    useEffect(() => {
        fetchCrypto();
    },[]);

    return(
        <DashboardLayout>
            <AnimatedPage>
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-6 rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Live Crypto Dashboard
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Track cryptocurrencies in real-time
                                    {lastFetch && (
                                        <span className="ml-2">
                                        • Last updated: {lastFetch.toLocaleTimeString()}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        {/* Refresh Button */}
                        <button
                        onClick={() => fetchCrypto(true)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin">
                                <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                            </div>
                            <p className="ml-4 text-gray-500 dark:text-gray-400">Loading live crypto data...</p>
                        </div>
                    ): (
                        <>
                            {/* Market Stats */}
                            {coins.length > 0 && <CryptoStats coins={coins} />}

                            {/* Top 3 Cryptocurrencies */}
                            {coins.length > 0 && <TopCryptos coins={coins} />}

                            {/* Filters */}
                            <CryptoFilters data={coins} setFiltered={setFiltered} />

                            {/* Table */}
                            {filtered.length > 0 ? (
                                <CryptoTable coins={filtered} />
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400">No cryptocurrencies found matching your filters.</p>
                                </div>
                            )}
                        </>
                    )}
                    {/* Rate Limit Info */}
                    {config.isDevelopment && (
                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        Remaining API calls: {cryptoLimiter.getRemainingRequests()}/{config.apiRateLimitRequests}
                        </div>
                    )}
                </div>
            </AnimatedPage>
        </DashboardLayout>
    );
};

export default Crypto;