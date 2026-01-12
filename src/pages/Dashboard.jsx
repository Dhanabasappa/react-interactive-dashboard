import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileJson, FileSpreadsheet, FileText, Loader, CheckCircle2, Circle } from 'lucide-react'
import AnimatedPage from '../components/AnimatedPage'
import UploadZone from '../components/UploadZone'
import DashboardLayout from '../components/DashboardLayout'
import DashboardHome from '../components/DashboardHome'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState({
    filesCount: 0,
    chartsCount: 0,
    recordsCount: 0,
    storageUsed: '0 MB'
  })

  const [loadingDataset, setLoadingDataset] = useState(null)
  const uploadZoneRef = useRef(null)
  const [workflowStep, setWorkflowStep] = useState(0) // 0: Ready, 1: Data Uploaded, 2: Charts Generated

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('dashboardStats')
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
  }, [])

  const updateStats = (newStats) => {
    setStats(newStats)
    setWorkflowStep(1) // File uploaded
    localStorage.setItem('dashboardStats', JSON.stringify(newStats))
  }

  const sampleDatasets = [
    {
      name: "Sales Data",
      description: "Monthly sales performance",
      icon: <FileSpreadsheet className="w-5 h-5" />,
      file: "sales_data.csv",
      size: "45 KB",
      path: "/files/sales_data.csv"
    },
    {
      name: "Employee Performance",
      description: "Performance metrics",
      icon: <FileJson className="w-5 h-5" />,
      file: "employee_performence.json",
      size: "32 KB",
      path: "/files/employee_performence.json"
    },
    {
      name: "Sales (Messy)",
      description: "Raw sales data",
      icon: <FileText className="w-5 h-5" />,
      file: "messy_sales.csv",
      size: "67 KB",
      path: "/files/messy_sales.csv"
    }
  ]

  const loadSampleDataset = async (dataset) => {
    setLoadingDataset(dataset.file)
    try {
      const response = await fetch(dataset.path)
      if (!response.ok) throw new Error('Failed to fetch file')

      const blob = await response.blob()
      
      // Determine correct MIME type based on file extension
      let mimeType = 'text/plain'
      if (dataset.file.endsWith('.json')) {
        mimeType = 'application/json'
      } else if (dataset.file.endsWith('.csv')) {
        mimeType = 'text/csv'
      } else if (dataset.file.endsWith('.xlsx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }

      const file = new File([blob], dataset.file, { type: mimeType })

      // Trigger the upload zone to load this file
      if (uploadZoneRef.current) {
        uploadZoneRef.current.loadFile(file)
        setWorkflowStep(1) // File loaded
      }

      toast.success(`Loaded ${dataset.name}!`)
    } catch (error) {
      toast.error(`Failed to load ${dataset.name}`)
      console.error(error)
    } finally {
      setLoadingDataset(null)
    }
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
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Data Analytics Dashboard
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-12">
              Upload, visualize, and analyze your data with interactive charts
            </p>
          </motion.div>

          {/* Stats */}
          <DashboardHome stats={stats} />

          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <UploadZone ref={uploadZoneRef} onStatsUpdate={updateStats} />
          </motion.div>

          {/* Sample Datasets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sample Datasets</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Click any sample to auto-load and visualize with multiple chart types
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleDatasets.map((dataset, index) => (
                <motion.button
                  key={index}
                  whileHover={{ y: -5 }}
                  onClick={() => loadSampleDataset(dataset)}
                  disabled={loadingDataset === dataset.file}
                  className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-lg transition-all text-left disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-white dark:bg-gray-500 rounded-lg text-indigo-600 dark:text-indigo-300">
                      {loadingDataset === dataset.file ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        dataset.icon
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-300">{dataset.size}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{dataset.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{dataset.description}</p>
                  {loadingDataset === dataset.file && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">Loading...</p>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </AnimatedPage>
    </DashboardLayout>
  )
}

export default Dashboard