import { mdiWeatherCloudy,mdiWeatherSunny,
    mdiWeatherRainy,mdiWeatherFog,mdiWeatherSnowy } from "@mdi/js";

export const getweatherIcon = (condition) => {
    switch(condition){
        case "Clouds":
            return mdiWeatherCloudy;
        
        case "Rain":
            return mdiWeatherRainy;
        
        case "Clear":
            return mdiWeatherSunny; 

        case "Mist":
        case "Haze":
        case "Fog":
            return mdiWeatherFog;

        case "Snow":
            return mdiWeatherSnowy;

        default:
            return mdiWeatherCloudy;
    }
};