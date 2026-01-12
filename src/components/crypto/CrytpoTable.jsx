import {LineChart,Line,ResponsiveContainer} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import CryptoDetailModal from "./CryptoDetailModal";

const CryptoTable = ({coins}) => {
    const [watchlist, setWatchlist] = useState(() => {
        const saved = localStorage.getItem("cryptoWatchlist");
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const openCoinDetail = (coin) => {
        setSelectedCoin(coin);
        setIsModalOpen(true);
    };

    return(
        <>
            <motion.div 
                initial={{opacity:0,y:20}} 
                animate={{opacity:1,y:0}} 
                transition={{duration:0.5}}
                className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 overflow-x-auto shadow-lg"
            >
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-600 dark:text-gray-400 text-sm border-b border-gray-300 dark:border-gray-600">
                            <th className="p-4 font-semibold">★</th>
                            <th className="p-4 font-semibold">Coin</th>
                            <th className="p-4 font-semibold">Price</th>
                            <th className="p-4 font-semibold">24h Change</th>
                            <th className="p-4 font-semibold">Market Cap</th>
                            <th className="p-4 font-semibold">7d Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coins.map((coin,i) => (
                            <motion.tr 
                                key={coin.id} 
                                initial={{opacity:0,x:-20}} 
                                animate={{opacity:1,x:0}} 
                                transition={{delay:i*0.02}}
                                whileHover={{backgroundColor:"rgba(59,130,246,0.05)"}}
                                onClick={() => openCoinDetail(coin)}
                                className={`border-b border-gray-200 dark:border-gray-700 transition-colors cursor-pointer ${
                                    coin.price_change_percentage_24h > 0 ? "hover:bg-green-50 dark:hover:bg-green-900/10" : "hover:bg-red-50 dark:hover:bg-red-900/10"
                                }`}
                            >
                                <td className="p-4">
                                    <motion.button
                                        whileHover={{scale:1.2}}
                                        whileTap={{scale:0.95}}
                                        onClick={(e) => toggleWatchlist(coin.id, e)}
                                        className={`text-lg transition-colors ${
                                            watchlist.includes(coin.id) ? "text-yellow-500" : "text-gray-400"
                                        }`}
                                    >
                                        ★
                                    </motion.button>
                                </td>
                                <td className="p-4 flex items-center gap-3">
                                    <img src={coin.image} alt="" className="w-8 h-8 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{coin.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{coin.symbol.toUpperCase()}</p>
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-gray-900 dark:text-white">
                                    ${coin.current_price.toLocaleString()}
                                </td>
                                <td className={`p-4 font-semibold flex items-center gap-2 ${
                                    coin.price_change_percentage_24h > 0 ? "text-green-600" : "text-red-600"
                                }`}>
                                    {coin.price_change_percentage_24h > 0 ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    {coin.price_change_percentage_24h?.toFixed(2)}%
                                </td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">
                                    ${coin.market_cap ? (coin.market_cap / 1e9).toFixed(2) + "B" : "N/A"}
                                </td>
                                {/**mini sparkline chart */}
                                <td className="p-4 w-32">
                                    <ResponsiveContainer width="100%" height={50}>
                                        <LineChart data={(coin.sparkline_in_7d.price || []).map((v,i) =>({value:v,index:i}))}>
                                            <Line 
                                                type="monotone" 
                                                dataKey="value" 
                                                stroke={coin.price_change_percentage_24h > 0 ? "#10b981" : "#ef4444"}
                                                dot={false} 
                                                strokeWidth={2.5}
                                                isAnimationActive={true}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Crypto Detail Modal */}
            <CryptoDetailModal 
                coin={selectedCoin} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
};

export default CryptoTable;