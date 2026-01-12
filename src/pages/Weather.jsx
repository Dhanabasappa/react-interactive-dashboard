import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import CurrentWeatherCard from "../components/weather/CurrentWeatherCard";
import ForecastCards from "../components/weather/ForecastCards";
import HourlyChart from "../components/weather/HourlyChart";
import WeatherPanel from "../components/weather/WeatherPanel";
import { useEffect, useState } from "react";
import AnimatedPage from "../components/AnimatedPage";
import toast from "react-hot-toast";
import { WifiOff,Key,MapPin,AlertTriangle } from "lucide-react";
import WeatherOverlay from "../components/weather/WeatherOverlay";
import WeatherMap from "../components/weather/WeatherMap";
import { config } from "../config/env";
import { errorHandler } from "../utils/errorHandler";
import { sanitizeInput } from "../utils/validation";


const API_KEY = config.openWeatherApiKey;
if (!API_KEY) {
  console.error('OpenWeather API key is not configured. Please set VITE_OPENWEATHER_API_KEY in your .env file');
}
//Free onecall 2.5 endpoint
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";  
const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";

const errors = {
    NO_INTERNET: {
        icon: <WifiOff className="w-6 h-6 mr-2 text-red-500" size={42}/>,
        title: "No Internet Connection",
        message: "No internet connection. Please check your network.",
    },
    INVALID_API_KEY: {
        icon: <Key className="w-6 h-6 mr-2 text-red-500" size={42}/>,
        title: "Invalid API Key",
        message: "The provided API key is invalid. Please check your configuration.",
    },
    CITY_NOT_FOUND: {
        icon: <MapPin className="w-6 h-6 mr-2 text-red-500" size={42}/>,
        title: "City Not Found",
        message: "The specified city could not be found. Please check the city name.",
    },
    UNKNOWN_ERROR: {
        icon: <AlertTriangle className="w-6 h-6 mr-2 text-red-500" size={42}/>,
        title: "Unknown Error",
        message: "An unknown error occurred while fetching weather data.",
    },
};

const Weather = () => {
    const [query,setQuery] = useState("");
    const [current,setCurrent] = useState(null);
    const [hourly,setHourly] = useState([]);
    const [daily,setDaily] = useState([]);
    const [activeIndex,setActiveIndex] = useState(-1);
    const [city,setCity] = useState("Bengaluru");
    const [unit,setUnit] = useState("C"); //metric or imperial
    const [showMap,setShowMap] = useState(false);
    const [overlayVisible,setOverlayVisible] = useState(false);
    const [status,setStatus] = useState("idle"); // idle / loading/success/error
    const [errorType,setErrorType] = useState(null);
    const [suggestions,setSuggestions] = useState([]);
    const [showSuggestions,setShowSuggestions] = useState(false);

    useEffect(() => {
        if(query.length < 2){
            setSuggestions([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try{
                const res = await axios.get("https://api.openweathermap.org/geo/1.0/direct",{
                    params:{q:query,limit:5,appid:API_KEY,}, }
                );
                setSuggestions(res.data);
                setShowSuggestions(true);
                setActiveIndex(-1);
            }catch{
                setSuggestions([]);
            }
        },400);
        return () => clearTimeout(timeout);
    },[query]);

    const convertTemp = (tempC) => {
        return unit === "C" ? tempC : (tempC * 9)/5 + 32;
    };

    const handleKeydown = (e) => {
        if(!showSuggestions || suggestions.length === 0) return;

        if(e.key === "ArrowDown"){
            setActiveIndex((prev) => prev < suggestions.length - 1 ? prev + 1 : 0);
        }

        if(e.key === "ArrowUp"){
            setActiveIndex((prev) => prev > 0 ? prev - 1 : suggestions.length - 1);
        }

        if(e.key === "Enter"){
            if(activeIndex >= 0){
                const selected = suggestions[activeIndex];
                fetchWeather(selected.name);
                setQuery(selected.name);
                setShowSuggestions(false);
                setActiveIndex(-1);
            }else{
                handleSearch();
            }
        }
    };

    const openMap = () => {
        setOverlayVisible(true);
        setShowMap(true);

        setTimeout(() => {
            setOverlayVisible(false);
        }, 1500);
    };

    const handleSearch = () => {
        if(!query.trim()) return;
        fetchWeather(query);
        setShowSuggestions(false);
    };

    const WeatherError = ({type}) => {
        const error = errors[type];
        if(!error) return null;

        return(
            <div className="flex flex-col items-center justify-center h-64 text-gray-600 dark:text-gray-300">
                <div className="mb-4 text-red-500">{error.icon}</div>
                <h2 className="text-xl font-semibold">{error.title}</h2>
                <p className="mt-2 text-sm">{error.message}</p>
            </div>
        );
    };

    const fetchWeather = async (cityname) => {
        try{
            setStatus("loading");
            setErrorType(null);
            // Sanitize city name input
            const sanitizedCity = sanitizeInput(cityname, 'city');
            if (!sanitizedCity) {
            toast.error('Please enter a valid city name');
            setStatus("idle");
            return;
            }
            const currentRes = await axios.get(CURRENT_URL,
                {params:{q:cityname,appid:API_KEY,units:"metric",}},);
            setCurrent(currentRes.data);
            //fetch detailed weather + forecast 
            const forecastRes = await axios.get(FORECAST_URL,
                {params:{q:cityname,appid:API_KEY,units:"metric",}},);
            processForecast(forecastRes.data.list);

            setCity(cityname); //update only on success
            setQuery("");
            setStatus("success");
        }catch(err){
            console.error(err);
            setStatus("error");

            if(!navigator.onLine){
                setErrorType("NO_INTERNET");
            }else if(err.response?.status === 401){
                setErrorType("INVALID_API_KEY");
            }else if(err.response?.status === 404){
                setErrorType("CITY_NOT_FOUND");
            }else{
                setErrorType("UNKNOWN_ERROR");
            }
            //centralized error handler
            errorHandler(err,toast);
        }
    };
    
    const fetchByCoords =  async(lat,lon) => {
        try{
            setStatus("loading");
            const currentRes = await axios.get(CURRENT_URL,
                {params:{lat,lon,appid:API_KEY,units:"metric"},
            });
            setCurrent(currentRes.data);
            setCity(currentRes.data.name);

            const forecastRes = await axios.get(FORECAST_URL,
                {params:{lat,lon,appid:API_KEY,units:"metric"},
            });
            processForecast(forecastRes.data.list);
            setStatus("success");
        }catch(err){
            console.error(err);
            toast.error("Failed to load weather by coordinates...");
        }
    };

    const processForecast = (list) => {
        setHourly(list.slice(0,8)); //next 24 hours (3-hour intervals)

        //process daily forecast (next 7 days)
        const dailyData = list.filter((_,i) => i % 8 === 0).slice(0,7);
        setDaily(dailyData);
    };
    
    const useMyLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => 
          fetchByCoords(position.coords.latitude,position.coords.longitude),
          () => toast.error("Location access denied.")
        );
    };

    useEffect(() => {
        fetchWeather(city);
        const contoller = new AbortController();
        const fetchData = async() => {
            try{
                await axios.get(URL,{signal:contoller.signal});
            }catch(err){
                if(err.name  === "AbortError"){
                    toast.error("Request aborted");
                }
            };
        }
        fetchData();
        return () => contoller.abort();
    },[]);
        
    useEffect(() => {
        document.body.style.overflow = showMap ? "hidden" : "auto";
    },[showMap]);

    return(
        <DashboardLayout>
            {!showMap ? (
                <AnimatedPage>
                    <div className="relative w-full max-w-full">
                        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 rounded-2xl shadow-lg">
                            <h1 className="text-3xl font-semibold mb-6">Weather Dashboard</h1>
                            
                            {/**weather search */}
                            <div className="flex gap-3 mb-6">
                                <div className="relative flex-1">
                                    <input value={query} onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={handleKeydown}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false),150)}
                                        onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                                        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 outline-none"
                                        placeholder="search city..."/>

                                    {showSuggestions && suggestions.length > 0 && (
                                        <ul className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
                                            {suggestions.map((c,i) => (
                                                <li key={i} onClick={() => {
                                                    setQuery(c.name);
                                                    setShowSuggestions(false);
                                                    fetchWeather(c.name);
                                                    setActiveIndex(-1);
                                                }}
                                                className={`px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer
                                                    ${i === activeIndex ? "bg-blue-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                                                    <span>
                                                        <strong>{c.name.slice(0,query.length)}</strong>
                                                        {c.name.slice(query.length)}, {c.country}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <button onClick={handleSearch}
                                    className="px-4 py-2 bg-blue-500 text-white rounded">
                                    Search
                                </button>
                                <button onClick={useMyLocation}
                                    className="px-4 py-2 bg-green-600 text-white rounded">
                                    Use My Location
                                </button>
                            </div>

                            {status === "loading" && (
                                <p className="mt-10 animate-pulse text-gray-500 dark:text-gray-400">Fetching weather details...</p>
                            )}

                            {status === "error" && (
                                <WeatherError type={errorType}/>
                            )}

                            {status === "success" && (
                                <>
                                    <h2 className="text-xl font-medium mb-2 text-center">
                                        Weather in <span className="font-bold">{city}</span>
                                    </h2>
                                    <div className="flex justify-center gap-2 mb-4">
                                        <button onClick={() => setUnit("C")}
                                            className={`px-3 py-1 rounded ${unit === "C" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
                                            °C
                                        </button>
                                        <button onClick={() => setUnit("F")}
                                            className={`px-3 py-1 rounded ${unit === "F" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
                                            °F
                                        </button>
                                    </div>
                                    {current && (<CurrentWeatherCard data={current} unit={unit} convertTemp={convertTemp}/>)}
                                    {current && (<WeatherPanel data={current}/>)}
                                    <button onClick={openMap} 
                                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded block mx-auto mb-8">
                                        show Map
                                    </button>
                                    {hourly.length > 0 && (<HourlyChart data={hourly} unit={unit} convertTemp={convertTemp}/>)}
                                    {daily.length > 0 && (<ForecastCards data={daily} unit={unit} convertTemp={convertTemp}/>)}
                                </>
                            )}
                        </div>
                    </div>
                </AnimatedPage>
            ) : (
                <>
                    {/**full-screen map view */}
                    {showMap && current && (
                        <>
                            {/**cinematic overlay only for 1.5s*/}
                            {overlayVisible && (
                                <WeatherOverlay condition={current.weather[0].main}/>
                            )}
                            {/**leaflet map */}
                            {!overlayVisible && (
                                <WeatherMap lat={current.coord.lat} lon={current.coord.lon}/>
                            )}
                        </>
                    )}
                    {/**close button and description - rendered after map to ensure they appear on top */}
                    {showMap && current && (
                        <>
                            <button onClick={() => setShowMap(false)}
                                className="fixed top-20 right-8 z-[9999] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                                ✕ Close Map
                            </button>
                            <div className="fixed top-32 right-8 z-[9999] bg-blue-600 text-white px-4 py-3 rounded-lg text-sm max-w-xs">
                                <p className="font-semibold mb-2">Map Controls:</p>
                                <p>Press <strong>-</strong> to zoom out</p>
                                <p>Press <strong>+ </strong> to zoom in</p>
                            </div>
                        </>
                    )}
                </>
            )}
        </DashboardLayout>
    );
};

export default Weather;