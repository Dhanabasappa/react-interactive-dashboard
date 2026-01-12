import {Icon} from "@mdi/react";
import {getweatherIcon} from "./weatherIcons";
import { motion } from "framer-motion";

const ForecastCards = ({data,unit,convertTemp}) => {
    if(!data) return null;

    const getWeatherGradient = (weatherCondition) => {
        const condition = weatherCondition?.toLowerCase() || "";
        
        if(condition.includes("sunny") || condition.includes("clear")) {
            return "from-yellow-400 to-yellow-600";
        } else if(condition.includes("cloud")) {
            return "from-gray-400 to-gray-600";
        } else if(condition.includes("rain")) {
            return "from-blue-400 to-blue-600";
        } else if(condition.includes("snow")) {
            return "from-blue-300 to-blue-500";
        } else if(condition.includes("fog") || condition.includes("mist")) {
            return "from-gray-300 to-gray-500";
        } else if(condition.includes("thunderstorm")) {
            return "from-purple-500 to-purple-700";
        }
        return "from-cyan-400 to-cyan-600";
    };

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

    return(
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                7-Day Forecast
            </h3>
            <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
                variants={containerVariants}
            >
                {data.map((day,i) => {
                    const iconpath = getweatherIcon(day.weather?.[0]?.main);
                    const weatherMain = day.weather?.[0]?.main || "";
                    const gradient = getWeatherGradient(weatherMain);
                    const maxTemp = Math.round(convertTemp(day.main.temp_max));
                    const minTemp = Math.round(convertTemp(day.main.temp_min));
                    
                    return( 
                        <motion.div 
                            key={i}
                            variants={cardVariants}
                            whileHover={{ scale: 1.05, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className={`bg-gradient-to-br ${gradient} p-4 rounded-xl text-white text-center shadow-lg hover:shadow-2xl transition-shadow cursor-pointer`}
                        >
                            <p className="text-sm font-semibold">
                                {new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: 'short', })}
                            </p>

                            <Icon path={iconpath} size={2.5} 
                                className="mx-auto my-3 drop-shadow-lg"
                            />

                            <div className="space-y-1">
                                <p className="font-bold text-lg">{maxTemp}°</p>
                                <p className="text-xs opacity-80">{minTemp}°</p>
                            </div>
                            
                            <p className="text-xs mt-2 capitalize opacity-90">
                                {day.weather?.[0]?.main}
                            </p>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
};
export default ForecastCards;