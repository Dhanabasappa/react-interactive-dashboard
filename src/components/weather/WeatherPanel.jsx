import { motion } from "framer-motion";
import { Droplets, Wind, Eye, Gauge, Sun, Moon } from "lucide-react";

const WeatherPanel = ({ data }) => {
    if (!data) return null;

    const panelItems = [
        {
            icon: <Droplets className="w-5 h-5" />,
            label: "Humidity",
            value: `${data.main.humidity}%`,
            color: "from-blue-500 to-blue-600"
        },
        {
            icon: <Wind className="w-5 h-5" />,
            label: "Wind Speed",
            value: `${data.wind.speed} m/s`,
            color: "from-cyan-500 to-cyan-600"
        },
        {
            icon: <Gauge className="w-5 h-5" />,
            label: "Pressure",
            value: `${data.main.pressure} hPa`,
            color: "from-purple-500 to-purple-600"
        },
        {
            icon: <Eye className="w-5 h-5" />,
            label: "Visibility",
            value: `${(data.visibility / 1000).toFixed(1)} km`,
            color: "from-orange-500 to-orange-600"
        },
        {
            icon: <Sun className="w-5 h-5" />,
            label: "Sunrise",
            value: new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            color: "from-yellow-500 to-yellow-600"
        },
        {
            icon: <Moon className="w-5 h-5" />,
            label: "Sunset",
            value: new Date(data.sys.sunset * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            color: "from-indigo-500 to-indigo-600"
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
            className="mt-8 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Weather Details</h3>
            <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                variants={containerVariants}
            >
                {panelItems.map((item, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className={`bg-gradient-to-br ${item.color} p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-shadow`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{item.icon}</span>
                        </div>
                        <p className="text-xs font-medium opacity-90">{item.label}</p>
                        <p className="text-lg font-bold mt-1">{item.value}</p>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default WeatherPanel;
