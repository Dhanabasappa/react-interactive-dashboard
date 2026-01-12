import { createContext, useState, useCallback } from 'react'

export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'File Uploaded',
      message: 'sales_data.csv uploaded successfully',
      timestamp: new Date(),
      icon: '📁'
    },
    {
      id: 2,
      type: 'info',
      title: 'Charts Generated',
      message: 'Multi-chart visualization created',
      timestamp: new Date(Date.now() - 300000),
      icon: '📊'
    },
    {
      id: 3,
      type: 'success',
      title: 'Data Processed',
      message: '12 records loaded and analyzed',
      timestamp: new Date(Date.now() - 600000),
      icon: '✓'
    }
  ])

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    }
    setNotifications(prev => [newNotification, ...prev])
    return newNotification.id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        getUnreadCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
