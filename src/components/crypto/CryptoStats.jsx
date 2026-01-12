import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Activity } from "lucide-react";

const CryptoStats = ({ coins }) => {
    if (!coins || coins.length === 0) return null;

    const totalMarketCap = coins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    const total24hVolume = coins.reduce((sum, coin) => sum + (coin.total_volume || 0), 0);
    const avgChange = coins.reduce((sum, coin) => sum + (coin.price_change_percentage_24h || 0), 0) / coins.length;

    const stats = [
        {
            label: "Total Market Cap",
            value: `$${(totalMarketCap / 1e12).toFixed(2)}T`,
            icon: <DollarSign className="w-5 h-5" />,
            gradient: "from-blue-500 to-blue-600"
        },
        {
            label: "24h Volume",
            value: `$${(total24hVolume / 1e9).toFixed(2)}B`,
            icon: <Activity className="w-5 h-5" />,
            gradient: "from-purple-500 to-purple-600"
        },
        {
            label: "Avg 24h Change",
            value: `${avgChange.toFixed(2)}%`,
            icon: <TrendingUp className="w-5 h-5" />,
            gradient: avgChange > 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`bg-gradient-to-br ${stat.gradient} p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl opacity-80">{stat.icon}</span>
                        <div className="animate-pulse text-white/50">●</div>
                    </div>
                    <p className="text-sm opacity-90 mb-2">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default CryptoStats;
