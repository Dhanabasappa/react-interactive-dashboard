import { createContext, useState, useCallback, useEffect } from 'react'

export const AchievementsContext = createContext()

export const AchievementsProvider = ({ children }) => {
  const [achievements, setAchievements] = useState([
    {
      id: 'first_chart',
      name: 'First Chart',
      description: 'Generate your first chart',
      icon: '📊',
      unlocked: true,
      unlockedDate: new Date('2024-02-01'),
      progress: 1,
      maxProgress: 1
    },
    {
      id: 'file_master',
      name: 'File Master',
      description: 'Upload 5 files',
      icon: '📁',
      unlocked: false,
      unlockedDate: null,
      progress: 3,
      maxProgress: 5
    },
    {
      id: 'chart_genius',
      name: 'Chart Genius',
      description: 'Generate 20 charts',
      icon: '🎨',
      unlocked: false,
      unlockedDate: null,
      progress: 12,
      maxProgress: 20
    },
    {
      id: 'data_master',
      name: 'Data Master',
      description: 'Process 1000+ records',
      icon: '📈',
      unlocked: false,
      unlockedDate: null,
      progress: 850,
      maxProgress: 1000
    },
    {
      id: 'quick_analyzer',
      name: 'Quick Analyzer',
      description: 'Generate chart in under 30 seconds',
      icon: '⚡',
      unlocked: true,
      unlockedDate: new Date('2024-03-15'),
      progress: 1,
      maxProgress: 1
    },
    {
      id: 'multi_chart_pro',
      name: 'Multi-Chart Pro',
      description: 'Use all 5 chart types',
      icon: '🏆',
      unlocked: false,
      unlockedDate: null,
      progress: 3,
      maxProgress: 5
    },
    {
      id: 'consistency_champion',
      name: 'Consistency Champion',
      description: 'Upload files for 7 consecutive days',
      icon: '🔥',
      unlocked: false,
      unlockedDate: null,
      progress: 4,
      maxProgress: 7
    },
    {
      id: 'collector',
      name: 'Collector',
      description: 'Unlock 5 achievements',
      icon: '⭐',
      unlocked: false,
      unlockedDate: null,
      progress: 2,
      maxProgress: 5
    }
  ])

  const [activityHistory, setActivityHistory] = useState([
    {
      id: 1,
      type: 'file_upload',
      title: 'Uploaded sales_data.csv',
      timestamp: new Date(Date.now() - 3600000),
      details: '12 records processed'
    },
    {
      id: 2,
      type: 'chart_generated',
      title: 'Generated multi-chart visualization',
      timestamp: new Date(Date.now() - 7200000),
      details: '4 different chart types'
    },
    {
      id: 3,
      type: 'achievement_unlocked',
      title: 'Unlocked: First Chart',
      timestamp: new Date('2024-02-01'),
      details: 'Achievement progress'
    }
  ])

  const [dashboardSettings, setDashboardSettings] = useState({
    defaultChartType: 'auto',
    animationsEnabled: true,
    showNotifications: true,
    darkModeByDefault: false,
    widgetLayout: ['stats', 'upload', 'samples'],
    autoRefreshCharts: true
  })

  const unlockAchievement = useCallback((achievementId) => {
    setAchievements(prev =>
      prev.map(ach =>
        ach.id === achievementId && !ach.unlocked
          ? { ...ach, unlocked: true, unlockedDate: new Date(), progress: ach.maxProgress }
          : ach
      )
    )

    addActivity({
      type: 'achievement_unlocked',
      title: `Unlocked: ${achievements.find(a => a.id === achievementId)?.name || 'Achievement'}`,
      details: 'Achievement progress'
    })
  }, [achievements])

  const updateProgress = useCallback((achievementId, newProgress) => {
    setAchievements(prev =>
      prev.map(ach => {
        if (ach.id === achievementId && newProgress !== ach.progress) {
          const updated = { ...ach, progress: Math.min(newProgress, ach.maxProgress) }
          // Auto-unlock if progress reaches max
          if (updated.progress >= ach.maxProgress && !ach.unlocked) {
            updated.unlocked = true
            updated.unlockedDate = new Date()
            unlockAchievement(achievementId)
          }
          return updated
        }
        return ach
      })
    )
  }, [unlockAchievement])

  const addActivity = useCallback((activity) => {
    const newActivity = {
      id: Date.now(),
      timestamp: new Date(),
      ...activity
    }
    setActivityHistory(prev => [newActivity, ...prev].slice(0, 50)) // Keep last 50 activities
  }, [])

  const updateDashboardSettings = useCallback((newSettings) => {
    setDashboardSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const getUnlockedCount = useCallback(() => {
    return achievements.filter(a => a.unlocked).length
  }, [achievements])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements))
    localStorage.setItem('activityHistory', JSON.stringify(activityHistory))
    localStorage.setItem('dashboardSettings', JSON.stringify(dashboardSettings))
  }, [achievements, activityHistory, dashboardSettings])

  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        activityHistory,
        dashboardSettings,
        unlockAchievement,
        updateProgress,
        addActivity,
        updateDashboardSettings,
        getUnlockedCount
      }}
    >
      {children}
    </AchievementsContext.Provider>
  )
}
