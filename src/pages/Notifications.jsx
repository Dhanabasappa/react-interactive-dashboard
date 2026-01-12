import { useContext } from 'react'
import { motion } from 'framer-motion'
import { Bell, Trash2, CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import AnimatedPage from '../components/AnimatedPage'
import { ThemeContext } from '../context/ThemeContext'
import { NotificationContext } from '../context/NotificationContext'

const Notifications = () => {
  const { darkMode } = useContext(ThemeContext)
  const { notifications, removeNotification, clearAllNotifications } = useContext(NotificationContext)

  const formatTime = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} className="text-green-500" />
      case 'error':
        return <AlertCircle size={24} className="text-red-500" />
      case 'warning':
        return <AlertTriangle size={24} className="text-yellow-500" />
      case 'info':
        return <Info size={24} className="text-blue-500" />
      default:
        return <Bell size={24} className="text-gray-500" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-l-4 border-gray-500'
    }
  }

  const groupedNotifications = {
    success: notifications.filter(n => n.type === 'success'),
    error: notifications.filter(n => n.type === 'error'),
    warning: notifications.filter(n => n.type === 'warning'),
    info: notifications.filter(n => n.type === 'info'),
    other: notifications.filter(n => !['success', 'error', 'warning', 'info'].includes(n.type))
  }

  const NotificationCard = ({ notification, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`p-6 rounded-xl border-l-4 transition-all hover:shadow-lg group ${getTypeColor(notification.type)} ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="mt-1">{getNotificationIcon(notification.type)}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {notification.title}
            </h3>
            <span className={`text-xs whitespace-nowrap font-medium ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {formatTime(notification.timestamp)}
            </span>
          </div>

          <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {notification.message}
          </p>

          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            notification.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
            notification.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          }`}>
            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
          </div>
        </div>

        {/* Delete Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => removeNotification(notification.id)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg ${
            darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
          }`}
          title="Delete notification"
        >
          <X size={20} />
        </motion.button>
      </div>
    </motion.div>
  )

  const NotificationSection = ({ title, items, icon, color }) => {
    if (items.length === 0) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${
            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {items.length}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((notification, index) => (
            <NotificationCard key={notification.id} notification={notification} index={index} />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <DashboardLayout>
      <AnimatedPage>
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Notifications
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {notifications.length} total notifications
                  </p>
                </div>
              </div>

              {notifications.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => clearAllNotifications()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold ${
                    darkMode
                      ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  <Trash2 size={18} />
                  Clear All
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'Success', count: groupedNotifications.success.length, color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-300' },
              { label: 'Info', count: groupedNotifications.info.length, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' },
              { label: 'Warning', count: groupedNotifications.warning.length, color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-300' },
              { label: 'Error', count: groupedNotifications.error.length, color: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className={`p-4 rounded-lg text-center font-semibold ${stat.color}`}
              >
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-xs mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Notifications Sections */}
          <div className="space-y-12">
            {notifications.length > 0 ? (
              <>
                <NotificationSection
                  title="Success"
                  items={groupedNotifications.success}
                  icon={<CheckCircle className="text-green-600" size={24} />}
                  color="bg-green-100 dark:bg-green-900/20"
                />
                <NotificationSection
                  title="Information"
                  items={groupedNotifications.info}
                  icon={<Info className="text-blue-600" size={24} />}
                  color="bg-blue-100 dark:bg-blue-900/20"
                />
                <NotificationSection
                  title="Warnings"
                  items={groupedNotifications.warning}
                  icon={<AlertTriangle className="text-yellow-600" size={24} />}
                  color="bg-yellow-100 dark:bg-yellow-900/20"
                />
                <NotificationSection
                  title="Errors"
                  items={groupedNotifications.error}
                  icon={<AlertCircle className="text-red-600" size={24} />}
                  color="bg-red-100 dark:bg-red-900/20"
                />
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col items-center justify-center py-16 px-4 rounded-xl ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}
              >
                <Bell size={48} className={`mb-4 opacity-50 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  No notifications yet
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your notifications will appear here when you upload files or generate charts
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </AnimatedPage>
    </DashboardLayout>
  )
}

export default Notifications
