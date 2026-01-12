import {Home, Settings, Menu, X, TrendingUp, Cloud, ChevronDown, Bell, UserCircle} from "lucide-react";
import { useState } from "react";
import {NavLink, useLocation} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import {FiMoon, FiSun} from "react-icons/fi";

const Sidebar = () => {
    const [open,setOpen] = useState(false);
    const { darkMode } = useContext(ThemeContext);

    return(
        <>
            {/**mobile toggle button */}
            <button className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-200 text-gray-900'}`} 
                    onClick={() => setOpen(!open)}>
                {open ? <X size={24}/> : <Menu size={24}/>}
            </button>

            {/**sidebar container */}
            <div className={`w-64 h-screen fixed left-0 top-0 flex flex-col p-5 space-y-6
                    z-40 transform transition-all duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                    ${darkMode ? 'bg-gray-800 text-gray-100 border-r border-gray-700' : 'bg-white text-gray-900 border-r border-gray-200'}`}>
                {/**logo */}
                <h1 className={`text-2xl font-bold tracking-wide ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>

                {/**navigation links */}
                <nav className="flex flex-col gap-4 flex-1">
                        <SidebarItem icon={<Home/>} label="Home" link="/" />
                        <SidebarItem icon={<TrendingUp />} label="Crypto" link="/crypto" />
                        <SidebarItem icon={<Cloud />} label="Weather" link="/weather" />
                        <SidebarItem icon={<UserCircle />} label="Profile" link="/profile" />
                        <SidebarItem icon={<Bell />} label="Notifications" link="/notifications" />
                        <SettingsDropdown />
                </nav>
            </div>
        </>
    );
};

//reusable component
const SidebarItem = ({icon,label,link,expnadable=false,open,onClick,active}) => {
    const { darkMode } = useContext(ThemeContext);
    const location = useLocation();
    const isNavActive = link && link === location.pathname;
    
    const content = (
        <div onClick={onClick} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all
        ${(active || open || isNavActive) ? "bg-blue-600 text-white" : (darkMode ? "text-blue-300 hover:bg-blue-900/30" : "text-blue-600 hover:bg-blue-100")}`}>
            <motion.div whileHover={{scale:1.15}} whileTap={{scale:0.95}}>
                <div className="text-2xl">{icon}</div>
            </motion.div>
            <motion.span className="text-lg font-bold" whileHover={{x:6}} transition={{duration:0.2}}>
                {label}
            </motion.span>

            {expnadable && (
                <motion.span animate={{rotate:open ? 90 : 0}} className="ml-auto">
                    <ChevronDown size={19}/>
                </motion.span>
            )}
        </div>
    );

    if(link){
        return(
            <NavLink to={link} className={({isActive}) => `rounded-xl transition ${isActive ? "bg-blue-600 text-white" : (darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900")}`}>
                {content}
            </NavLink>
        );
    }

    return content;
};

const SettingsDropdown = () => {
    const [open,setOpen] = useState(false);
    const {darkMode,toggleTheme} = useContext(ThemeContext);

    return(
        <div className="w-full">

            {/**settings row */}
            <SidebarItem icon={<Settings/>} 
                        label="Settings" expnadable={true} open={open} active={open} onClick={() => setOpen(!open)}/>

            {/**drop-down area*/}
            <AnimatePresence>
                {open && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                    className="ml-6 mt-2 flex flex-col gap-2 overflow-hidden">

                        {/**dark mode toggle */}
                        <div className={`flex items-center gap-3 rounded-xl cursor-pointer p-3 transition ${darkMode ? 'hover:bg-blue-900/30 text-blue-300' : 'hover:bg-blue-100 text-blue-600'}`}>

                            {/**icon */}
                            {darkMode ? <FiMoon size={18}/> : <FiSun size={18}/>}

                            {/**label */}
                            <span>Dark Mode</span>

                            {/**toggle switch */}
                            <label className=" ml-auto relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={darkMode} onChange={toggleTheme} className="sr-only peer"/>
                                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full
                                    peer dark:bg-gray-700 peer-checked:bg-blue-600 peer-checked:after:translate-x-full
                                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                    after:bg-white after:border-gray--300 after:border after:rounded-full
                                    after:h-5 after:w-5 after:transition-all dark:after:bg-white">
                                </div>
                            </label>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Sidebar;