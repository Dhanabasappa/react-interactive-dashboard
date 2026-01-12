import { LineChart,Line,XAxis,
    YAxis,Tooltip,ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const HourlyChart = ({data,unit,convertTemp}) => {
    if(!data || data.length === 0) return null;

    const chartData = data.map((hour) => ({
        time:new Date(hour.dt * 1000).getHours() + ":00",
        temp:Math.round(convertTemp(hour.main.temp)),
    }));

    return(
        <motion.div 
            initial={{opacity:0,y:20}} 
            animate={{opacity:1,y:0}} 
            transition={{duration:0.6}}
            className="mb-10 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-lg w-full overflow-hidden border border-blue-200 dark:border-gray-700"
        >
            <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Hourly Temperature
                </h3>
            </div>
            
            <div className="w-full" style={{height:"300px"}}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={chartData} margin={{top:5,right:20,left:0,bottom:5}}>
                        <defs>
                            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={1}/>
                                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#2AA5AC" style={{fontSize:"12px"}}/>
                        <YAxis stroke="#9CA3AF" style={{fontSize:"12px"}} 
                                label={{value:`Temp (°${unit})`,angle:-90,position:"insideLeft",style:{fill:"#9CA3AF"}}}/>
                        <Tooltip 
                            contentStyle={{
                                backgroundColor:"rgba(0,0,0,0.8)",
                                border:"2px solid #3B82F6",
                                borderRadius:"8px",
                                color:"white"
                            }}
                            formatter={(value) => [`${value}°${unit}`,"Temperature"]}
                            labelStyle={{color:"#fff"}}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="temp" 
                            stroke="#3B82F6" 
                            strokeWidth={3} 
                            dot={{fill:"#3B82F6",r:5,strokeWidth:2,stroke:"#fff"}}
                            activeDot={{r:7,strokeWidth:2,stroke:"#fff"}}
                            isAnimationActive={true}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default HourlyChart;