import { motion } from "framer-motion";
import { Upload, FileText, BarChart3, TrendingUp } from "lucide-react";

const DashboardHome = ({ stats }) => {
    const cards = [
        {
            label: "Files Uploaded",
            value: stats.filesCount || 0,
            icon: <FileText className="w-6 h-6" />,
            gradient: "from-blue-500 to-blue-600",
            bgGradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
        },
        {
            label: "Charts Generated",
            value: stats.chartsCount || 0,
            icon: <BarChart3 className="w-6 h-6" />,
            gradient: "from-purple-500 to-purple-600",
            bgGradient: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
        },
        {
            label: "Data Records",
            value: (stats.recordsCount || 0).toLocaleString(),
            icon: <TrendingUp className="w-6 h-6" />,
            gradient: "from-green-500 to-green-600",
            bgGradient: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
        },
        {
            label: "Storage Used",
            value: stats.storageUsed || "0 MB",
            icon: <Upload className="w-6 h-6" />,
            gradient: "from-orange-500 to-orange-600",
            bgGradient: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
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

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {cards.map((card, index) => (
                <motion.div
                    key={index}
                    variants={cardVariants}
                    whileHover={{ y: -5 }}
                    className={`bg-gradient-to-br ${card.bgGradient} p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow`}
                >
                    <div className={`bg-gradient-to-br ${card.gradient} p-3 rounded-lg w-fit mb-4`}>
                        <div className="text-white">{card.icon}</div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default DashboardHome;
