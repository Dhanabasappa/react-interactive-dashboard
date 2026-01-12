import RainOverlay from "./overlays/RainOverlay";;
import SnowOverlay from "./overlays/SnowOverlay";
import SunnyOverlay from "./overlays/SunnyOverlay";
import CloudOverlay from "./overlays/CloudOverlay";
import FogOverlay from "./overlays/FogOverlay";
import MistOverlay from "./overlays/MistOverlay";

const WeatherOverlay = ({ condition}) => {
    switch (condition) {
        case "Snow":
            return <SnowOverlay />;
        case "Rain":
            return <RainOverlay />;
        case "Clouds":
            return <CloudOverlay />;
        case "Clear":
            return <SunnyOverlay />;
        case "Fog":
            return <FogOverlay />;
        case "Mist":
            return <MistOverlay />;
        default:
            return null;
    }
};

export default WeatherOverlay;