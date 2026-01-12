import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { useState } from "react";

const TopCryptos = ({ coins }) => {
    const [watchlist, setWatchlist] = useState(() => {
        const saved = localStorage.getItem("cryptoWatchlist");
        return saved ? JSON.parse(saved) : [];
    });

    const topCoins = coins.slice(0, 3);

    const toggleWatchlist = (coinId, e) => {
        e.stopPropagation();
        let updated = [...watchlist];
        if (updated.includes(coinId)) {
            updated = updated.filter(id => id !== coinId);
        } else {
            updated.push(coinId);
        }
        setWatchlist(updated);
        localStorage.setItem("cryptoWatchlist", JSON.stringify(updated));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <motion.div
            className="mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Top 3 Cryptocurrencies
            </h3>
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topCoins.map((coin) => (
                    <motion.div
                        key={coin.id}
                        variants={cardVariants}
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{coin.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{coin.symbol.toUpperCase()}</p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => toggleWatchlist(coin.id, e)}
                                className={`${watchlist.includes(coin.id) ? "text-yellow-500" : "text-gray-400"}`}
                            >
                                <Star className="w-5 h-5" fill="currentColor" />
                            </motion.button>
                        </div>

                        <div className="mb-4">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${coin.current_price.toLocaleString()}
                            </p>
                            <p className={`text-sm font-semibold flex items-center gap-1 ${
                                coin.price_change_percentage_24h > 0 ? "text-green-600" : "text-red-600"
                            }`}>
                                {coin.price_change_percentage_24h > 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                ) : (
                                    <TrendingDown className="w-4 h-4" />
                                )}
                                {coin.price_change_percentage_24h?.toFixed(2)}%
                            </p>
                        </div>

                        <div style={{ marginBottom: '1rem', width: '100%', height: 60, overflow: 'hidden', borderRadius: '0.5rem' }}>
                            <ResponsiveContainer width="100%" height={60}>
                                <LineChart data={(coin.sparkline_in_7d.price || []).map((v, i) => ({ value: v, index: i }))}>
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={coin.price_change_percentage_24h > 0 ? "#10b981" : "#ef4444"}
                                        dot={false}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            <p>Market Cap: ${(coin.market_cap / 1e9).toFixed(2)}B</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default TopCryptos;
