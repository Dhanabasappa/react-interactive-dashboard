import Sidebar from "./Sidebar";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const DashboardLayout = ({children}) => {
    const { darkMode } = useContext(ThemeContext);

    return (
        <>
            <Sidebar />
            <main className={`fixed left-64 top-0 right-0 bottom-0 overflow-y-auto px-6 py-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                {children}
            </main>
        </>
    );
};

export default DashboardLayout;