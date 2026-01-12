import {MapContainer, TileLayer, Marker, ZoomControl,useMap} from 'react-leaflet';
import { motion } from 'framer-motion';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { useEffect, useState } from 'react';

const markerIcon = new L.icon({
    iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize:[25,41],
    iconAnchor:[12,41],
});

const ZoomHandler = ({zoomLevel}) => {
    const map = useMap();
    useEffect(() => {
        map.setZoom(zoomLevel);
    },[zoomLevel,map]);
    return null;
};

const WeatherMap =({lat,lon}) => {
    const [zoomLevel,setZoomLevel] = useState(11);

    const zoomIn = () => setZoomLevel(z => Math.min(z+1,18));
    const zoomOut = () => setZoomLevel(z => Math.max(z-1,4));
    
    useEffect(() => {
        const handleKey = (e) => {
            if(e.key === '+' || e.key === '=') zoomIn();
            if(e.key === '-') zoomOut();
        };

    window.addEventListener('keydown',handleKey);
    return () => window.removeEventListener('keydown',handleKey);
    },[]);

    return (
        <motion.div className="w-full h-full relative"
            initial={{ scale:0.95,opacity: 0 }}
            animate={{ scale:1,opacity: 1 }}
            transition={{ duration: 1.2,ease:"easeInOut" }}
        >
            <MapContainer center={[lat,lon]} zoom={zoomLevel} minZoom={4} maxZoom={18}
                zoomControl={false} className='w-full h-full absolute inset-0'>
                <ZoomHandler zoomLevel={zoomLevel}/>
                <TileLayer attribution='© OpenStreetMap'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'/>

                {/**user/city marker */}
                <Marker position={[lat,lon]} icon={markerIcon}/>

                <ZoomControl position='bottomright'/>
            </MapContainer>

            {/** Zoom Buttons */}
            <div className='absolute bottom-6 right-6 z-50 flex flex-col gap-2'>
                <button onClick={zoomOut} className='w-10 h-10 bg-black/70 text-white rounded-xl text-xl'>
                    +
                </button>
                <button onClick={zoomIn} className='w-10 h-10 bg-black/70 text-white rounded-xl text-xl'>
                    -
                </button>
            </div>
        </motion.div>
    );
};

export default WeatherMap;