import { useContext, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { sanitizeInput } from '../utils/validation';
import { User, Mail, MapPin, Briefcase, Edit, Save, X, Copy, Trophy, Activity, Settings as SettingsIcon, Zap, BarChart3, Bell } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import AnimatedPage from '../components/AnimatedPage'
import { ThemeContext } from '../context/ThemeContext'
import { AchievementsContext } from '../context/AchievementsContext'
import toast from 'react-hot-toast'

const UserProfile = () => {
  const { darkMode } = useContext(ThemeContext)
  const { achievements, activityHistory, dashboardSettings, updateDashboardSettings, getUnlockedCount } = useContext(AchievementsContext)
  const [isEditing, setIsEditing] = useState(false)
  const [joinDate, setJoinDate] = useState('')
  const [profileData, setProfileData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    location: 'San Francisco, CA',
    title: 'Data Analyst',
    bio: 'Passionate about data visualization and analytics'
  })

  const [editFormData, setEditFormData] = useState(profileData)
  const [userStats] = useState({
    filesUploaded: 12,
    chartsGenerated: 45,
    dataRecords: 2850,
    sessionTime: '42h 30m'
  })

  // Initialize join date on component mount
  useEffect(() => {
    const storedJoinDate = localStorage.getItem('userJoinDate')
    if (storedJoinDate) {
      setJoinDate(storedJoinDate)
    } else {
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem('userJoinDate', today)
      setJoinDate(today)
    }
  }, [])

  const getJoinYear = () => {
    if (joinDate) {
      return new Date(joinDate).getFullYear()
    }
    return new Date().getFullYear()
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    let sanitizedValue = value;
    
    // Apply appropriate sanitization based on field
    switch (name) {
      case 'email':
        sanitizedValue = sanitizeInput(value, 'email');
        break;
      case 'name':
        sanitizedValue = sanitizeInput(value, 'name');
        break;
      case 'location':
        sanitizedValue = sanitizeInput(value, 'location');
        break;
      case 'title':
        sanitizedValue = sanitizeInput(value, 'text');
        break;
      case 'bio':
        sanitizedValue = sanitizeInput(value, 'text');
        break;
      default:
        sanitizedValue = sanitizeInput(value, 'text');
    }
    
    setEditFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleSaveProfile = () => {
    // Validate email
    if (editFormData.email && !editFormData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    // Validate required fields
    if (!editFormData.name || editFormData.name.trim() === '') {
      toast.error('Name is required');
      return;
    }
    
    setProfileData(editFormData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditFormData(profileData)
    setIsEditing(false)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const formatTime = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'file_upload':
        return '📁'
      case 'chart_generated':
        return '📊'
      case 'achievement_unlocked':
        return '🏆'
      default:
        return '📝'
    }
  }

  const ProfileCard = ({ icon, label, value, editable = false, fieldName = '' }) => (
    <div className={`p-4 rounded-lg transition-all ${
      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          {icon && <motion.div whileHover={{scale: 1.1}}>{icon}</motion.div>}
        </div>
        <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {label}
        </span>
      </div>
      {isEditing && editable && fieldName ? (
        <input
          type="text"
          name={fieldName}
          value={editFormData[fieldName]}
          onChange={handleEditChange}
          className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-all ${
            darkMode
              ? 'bg-gray-600 border-gray-500 text-white focus:border-blue-500'
              : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
          }`}
        />
      ) : (
        <div className="flex items-center justify-between">
          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {!isEditing && value && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyToClipboard(value)}
              className={`p-2 rounded-lg transition-all ${
                darkMode ? 'hover:bg-gray-500 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
              }`}
              title="Copy to clipboard"
            >
              <Copy size={16} />
            </motion.button>
          )}
        </div>
      )}
    </div>
  )

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
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Profile
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage your account settings and preferences
                  </p>
                </div>
              </div>

              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold ${
                    darkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Edit size={18} />
                  Edit Profile
                </motion.button>
              ) : (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all font-semibold"
                  >
                    <Save size={18} />
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <X size={18} />
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            {/* Avatar & Name Section */}
            <div className="flex items-center gap-6 mb-8 pb-6 border-b" style={{ borderColor: darkMode ? '#4b5563' : '#e5e7eb' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <User size={48} />
                </div>
                <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 ${
                  darkMode ? 'bg-green-500 border-gray-800' : 'bg-green-500 border-white'
                }`} title="Online" />
              </motion.div>

              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    className={`w-full text-3xl font-bold mb-2 px-3 py-2 rounded-lg border-2 focus:outline-none ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
                    }`}
                  />
                ) : (
                  <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {profileData.name}
                  </h2>
                )}
                
                {isEditing ? (
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className={`w-full text-lg px-3 py-2 rounded-lg border-2 focus:outline-none ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-blue-300 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 text-blue-600 focus:border-blue-500'
                    }`}
                  />
                ) : (
                  <p className={`text-lg ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    {profileData.title}
                  </p>
                )}
                
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                  }`}>
                    ● Active
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}>
                    Member since {getJoinYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {[
                { label: 'Files Uploaded', value: userStats.filesUploaded, icon: '📁' },
                { label: 'Charts Generated', value: userStats.chartsGenerated, icon: '📊' },
                { label: 'Data Records', value: userStats.dataRecords, icon: '📈' },
                { label: 'Session Time', value: userStats.sessionTime, icon: '⏱️' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className={`p-4 rounded-lg text-center ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </div>
                  <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Bio Section */}
            {isEditing ? (
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={editFormData.bio}
                  onChange={handleEditChange}
                  rows="3"
                  className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-all ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                  }`}
                  placeholder="Tell us about yourself..."
                />
              </div>
            ) : (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Bio
                </p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profileData.bio}
                </p>
              </div>
            )}
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileCard
                icon={<Mail size={20} className="text-white" />}
                label="Email"
                value={profileData.email}
                editable={true}
                fieldName="email"
              />
              <ProfileCard
                icon={<MapPin size={20} className="text-white" />}
                label="Location"
                value={profileData.location}
                editable={true}
                fieldName="location"
              />
              <ProfileCard
                icon={<Briefcase size={20} className="text-white" />}
                label="Title"
                value={profileData.title}
                editable={true}
                fieldName="title"
              />
            </div>
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Achievements
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getUnlockedCount()} of {achievements.length} unlocked
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, idx) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  className={`p-4 rounded-lg text-center transition-all relative group ${
                    achievement.unlocked
                      ? darkMode ? 'bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border border-yellow-700/50' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200'
                      : darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className={`text-3xl mb-2 ${!achievement.unlocked && 'opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {achievement.description}
                  </p>
                  {!achievement.unlocked && (
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      />
                    </div>
                  )}
                  <p className={`text-xs mt-2 font-semibold ${
                    achievement.unlocked
                      ? 'text-yellow-600 dark:text-yellow-300'
                      : darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {achievement.unlocked ? '✓ Unlocked' : `${achievement.progress}/${achievement.maxProgress}`}
                  </p>
                  
                  {achievement.unlocked && achievement.unlockedDate && (
                    <div className={`absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                      darkMode ? 'bg-black/50' : 'bg-white/80'
                    }`}>
                      <span className={`text-xs font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Activity History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Activity size={24} className="text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h2>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityHistory.length > 0 ? (
                activityHistory.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.37 + idx * 0.02 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      activity.type === 'achievement_unlocked'
                        ? `border-yellow-500 ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`
                        : activity.type === 'file_upload'
                        ? `border-blue-500 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`
                        : `border-green-500 ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-1">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activity.title}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {activity.details}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No activity yet
                </p>
              )}
            </div>
          </motion.div>

          {/* Dashboard Customization Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.37 }}
            className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <SettingsIcon size={24} className="text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Dashboard Settings
              </h2>
            </div>

            <div className="space-y-4">
              {/* Default Chart Type */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Default Chart Type
                </label>
                <select
                  value={dashboardSettings.defaultChartType}
                  onChange={(e) => updateDashboardSettings({ defaultChartType: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-all ${
                    darkMode
                      ? 'bg-gray-600 border-gray-500 text-white focus:border-blue-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                  }`}
                >
                  <option value="auto">Auto Detect</option>
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="scatter">Scatter Plot</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'animationsEnabled', label: 'Enable Animations', icon: Zap },
                  { key: 'showNotifications', label: 'Show Notifications', icon: Bell },
                  { key: 'autoRefreshCharts', label: 'Auto Refresh Charts', icon: BarChart3 }
                ].map((setting, idx) => {
                  const Icon = setting.icon
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.38 + idx * 0.05 }}
                      className={`p-4 rounded-lg flex items-center justify-between ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={18} className="text-blue-500" />
                        <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {setting.label}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dashboardSettings[setting.key]}
                          onChange={(e) => updateDashboardSettings({ [setting.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer ${
                          darkMode ? 'bg-gray-600 peer-checked:bg-blue-600' : 'bg-gray-300 peer-checked:bg-blue-600'
                        } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                      </label>
                    </motion.div>
                  )
                })}
              </div>

              {/* Widget Layout Info */}
              <div className={`p-4 rounded-lg border-l-4 border-cyan-500 ${
                darkMode ? 'bg-cyan-900/20' : 'bg-cyan-50'
              }`}>
                <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  Current Widget Layout
                </p>
                <div className="flex flex-wrap gap-2">
                  {dashboardSettings.widgetLayout.map((widget, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        darkMode ? 'bg-cyan-700 text-cyan-200' : 'bg-cyan-200 text-cyan-700'
                      }`}
                    >
                      {widget}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </AnimatedPage>
    </DashboardLayout>
  )
}

export default UserProfile
