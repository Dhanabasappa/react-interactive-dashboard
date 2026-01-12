import React from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AchievementsProvider } from "./context/AchievementsContext";
import Crypto from "./pages/Crypto";
import Dashboard from "./pages/Dashboard";
import Weather from "./pages/Weather";
import Notifications from "./pages/Notifications";
import UserProfile from "./pages/UserProfile";


function App() {

  // No error boundary wrapper in App.jsx or main components
// Add this:
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AchievementsProvider>
          <Toaster position="top-center" toastOptions={{duration:3000,style:{background:"#1e293b",color:"white",borderRadius:"10px",},}}/>

            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/crypto" element={<Crypto />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<UserProfile />} />
              </Routes>
            </BrowserRouter>
        </AchievementsProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;