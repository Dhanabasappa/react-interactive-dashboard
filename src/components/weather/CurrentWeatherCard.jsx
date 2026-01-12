import { motion } from "framer-motion";
import {Icon} from "@mdi/react";
import {getweatherIcon} from "./weatherIcons";
import SunnyOverlay from "./overlays/SunnyOverlay";
import CloudOverlay from "./overlays/CloudOverlay";
import RainOverlay from "./overlays/RainOverlay";
import SnowOverlay from "./overlays/SnowOverlay";
import FogOverlay from "./overlays/FogOverlay";
import MistOverlay from "./overlays/MistOverlay";

const CurrentWeatherCard = ({data,unit,convertTemp}) => {
    if(!data) return null;

    const getWeatherBackground = (weatherMain) => {
        const condition = weatherMain?.toLowerCase() || "";
        
        switch(true) {
            case condition.includes("sunny") || condition.includes("clear"):
                return <SunnyOverlay isPersistent={true} />;
            case condition.includes("cloud"):
                return <CloudOverlay isPersistent={true} />;
            case condition.includes("rain"):
                return <RainOverlay isPersistent={true} />;
            case condition.includes("snow"):
                return <SnowOverlay isPersistent={true} />;
            case condition.includes("fog"):
                return <FogOverlay isPersistent={true} />;
            case condition.includes("mist"):
                return <MistOverlay isPersistent={true} />;
            default:
                return <CloudOverlay isPersistent={true} />;
        }
    };

    return(
        <motion.div 
            initial={{opacity:0,scale:0.95}} 
            animate={{opacity:1,scale:1}} 
            transition={{duration:0.4}}
            className="text-center mb-8 relative overflow-hidden rounded-2xl"
        >
            {/* Dynamic weather background */}
            <div className="absolute inset-0 rounded-2xl">
                {getWeatherBackground(data.weather[0].main)}
            </div>

            {/* Content overlay */}
            <div className="relative z-10 p-8 backdrop-blur-sm bg-white/10 dark:bg-gray-900/20 rounded-2xl">
                <Icon path={getweatherIcon(data.weather[0].main)} size={5} className="mx-auto text-blue-400"/>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{Math.round(convertTemp(data.main.temp))}°{unit}</h2>
                <p className="text-gray-600 mt-1 capitalize dark:text-gray-300">{(data.weather[0].description).toLowerCase()}</p>

                <div className="mt-4">
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                        Today is expected to be mostly {" "}
                        <span className="capitalize font-semibold">{data.weather[0].description}</span><br/>
                        Temperature will remain comfortable throughout the day.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6 text-sm">
                    <div className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-md p-3 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-300 text-xs">Feels Like</p>
                        <p className="font-bold text-gray-900 dark:text-white">{Math.round(convertTemp(data.main.feels_like))}°{unit}</p>
                    </div>
                    <div className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-md p-3 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-300 text-xs">Humidity</p>
                        <p className="font-bold text-gray-900 dark:text-white">{data.main.humidity}%</p>
                    </div>
                    <div className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-md p-3 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-300 text-xs">Wind</p>
                        <p className="font-bold text-gray-900 dark:text-white">{data.wind.speed} m/s</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CurrentWeatherCard;