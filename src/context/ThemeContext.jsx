import { createContext,useEffect,useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
    const [darkMode,setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

    //whenever darkmode changes,update html
    useEffect(() => {
        if(darkMode){
            document.documentElement.classList.add("dark");
        }else{
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode",darkMode);
    },[darkMode]);

    const toggleTheme = () => setDarkMode(!darkMode);

    return(
        <ThemeContext.Provider value={{darkMode,toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};