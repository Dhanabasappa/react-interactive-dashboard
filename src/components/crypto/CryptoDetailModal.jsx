import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { X, TrendingUp, TrendingDown, DollarSign, Activity, Target } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CryptoDetailModal = ({ coin, isOpen, onClose }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState("7d");

    const fetchChartData = async (days) => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart`,
                {
                    params: {
                        vs_currency: "usd",
                        days: days,
                        interval: "daily"
                    }
                }
            );

            // Format data for chart
            const formattedData = data.prices.map(([timestamp, price], index) => {
                const date = new Date(timestamp);
                const dateStr = days === "7" ? date.toLocaleDateString("en-US", { weekday: "short" }) :
                               days === "30" ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) :
                               date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                
                return {
                    date: dateStr,
                    price: Math.round(price * 100) / 100,
                    marketCap: data.market_caps[index]?.[1],
                    volume: data.total_volumes[index]?.[1]
                };
            });

            setChartData(formattedData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching chart data:", error);
            toast.error("Failed to fetch detailed chart data");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && coin) {
            const days = timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90";
            fetchChartData(days);
        }
    }, [isOpen, coin, timeRange]);

    if (!coin) return null;

    const highPrice = chartData.length > 0 ? Math.max(...chartData.map(d => d.price)) : 0;
    const lowPrice = chartData.length > 0 ? Math.min(...chartData.map(d => d.price)) : 0;
    const avgPrice = chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.price, 0) / chartData.length).toFixed(2) : 0;

    const priceChange = coin.price_change_percentage_24h || 0;
    const isPositive = priceChange > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed left-64 top-0 right-0 bottom-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
                    style={{ backdropFilter: "blur(4px)" }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between z-50">
                            <div className="flex items-center gap-4">
                                <img src={coin.image} alt={coin.name} className="w-16 h-16 rounded-full" />
                                <div className="text-white">
                                    <h2 className="text-3xl font-bold">{coin.name}</h2>
                                    <p className="text-blue-100">{coin.symbol.toUpperCase()}</p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition shadow-lg flex-shrink-0"
                                title="Close"
                            >
                                <X className="w-6 h-6" />
                            </motion.button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Current Price and Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${coin.current_price.toLocaleString()}
                                    </p>
                                </div>

                                <div className={`bg-gradient-to-br ${isPositive ? "from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30" : "from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30"} p-4 rounded-xl`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {isPositive ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                                        <p className="text-sm text-gray-600 dark:text-gray-400">24h Change</p>
                                    </div>
                                    <p className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                        {priceChange.toFixed(2)}%
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="w-4 h-4 text-purple-600" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Market Cap</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${coin.market_cap ? (coin.market_cap / 1e9).toFixed(2) + "B" : "N/A"}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="w-4 h-4 text-orange-600" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">24h Volume</p>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${coin.total_volume ? (coin.total_volume / 1e9).toFixed(2) + "B" : "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Time Range Selector */}
                            <div className="flex gap-2 justify-center flex-wrap">
                                {["7d", "30d", "90d"].map((range) => (
                                    <motion.button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                            timeRange === range
                                                ? "bg-blue-600 text-white shadow-lg"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300"
                                        }`}
                                    >
                                        {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Price Chart */}
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin">
                                        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                                    </div>
                                </div>
                            ) : chartData.length > 0 ? (
                                <>
                                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl">
                                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Price Movement</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={1} />
                                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                                                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                                                <Tooltip 
                                                    contentStyle={{
                                                        backgroundColor: "rgba(0,0,0,0.8)",
                                                        border: "2px solid #3B82F6",
                                                        borderRadius: "8px",
                                                        color: "white"
                                                    }}
                                                    formatter={(value) => `$${value.toLocaleString()}`}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="price"
                                                    stroke="#3B82F6"
                                                    strokeWidth={3}
                                                    dot={{ fill: "#3B82F6", r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                    isAnimationActive={true}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Statistics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Highest Price</p>
                                            <p className="text-2xl font-bold text-green-600">${highPrice.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Average Price</p>
                                            <p className="text-2xl font-bold text-purple-600">${avgPrice}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Lowest Price</p>
                                            <p className="text-2xl font-bold text-red-600">${lowPrice.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </>
                            ) : null}

                            {/* Additional Info */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">About {coin.name}</h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Analyzing the price movement and market performance of {coin.name} ({coin.symbol.toUpperCase()}) 
                                    over the selected time period. Current price stands at ${coin.current_price.toLocaleString()} with a 
                                    {isPositive ? " positive" : " negative"} trend of {priceChange.toFixed(2)}% in the last 24 hours.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CryptoDetailModal;
