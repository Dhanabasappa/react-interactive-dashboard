import { useCallback, useMemo, useState, useImperativeHandle, forwardRef, useRef, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import {validateFile,validateCSVData, validateJSONData} from "../utils/validation";
import { errorHandler, AppError } from '../utils/errorHandler';
import Papa from "papaparse"
import * as XLSX from "xlsx"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, ChevronDown, CheckCircle, AlertCircle, Download, RefreshCw, Settings, Table } from "lucide-react"
import MultiChartGrid from "./MultiChartGrid"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, TimeScale, ScatterController, Filler } from "chart.js"
import { Line, Bar, Pie, Scatter } from "react-chartjs-2"
import "chartjs-adapter-date-fns"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, TimeScale, ScatterController, Filler)

const detectColumnsFromData = (data) => {
  if (!data || data.length === 0) return []

  const sample = data.slice(0, Math.min(50, data.length))
  const keys = Object.keys(sample[0] || {})

  return keys.map((col) => {
    const values = sample.map((r) => r[col])
    // Filter out empty, null, undefined, and whitespace-only values
    const nonEmpty = values.filter((v) => {
      if (v === undefined || v === null) return false
      const str = String(v).trim()
      return str !== "" && str !== "N/A" && str !== "NA" && str !== "-"
    })
    
    if (nonEmpty.length === 0) {
      return {
        name: col,
        type: "text",
        sample: "",
        use: false,
        stats: { validCount: 0, total: values.length }
      }
    }

    // Test for numbers - more robust checking
    const numberValues = nonEmpty.map(v => {
      const str = String(v).trim()
      // Handle number formatting: remove commas, currency symbols, etc.
      const cleaned = str
        .replace(/[$,()]/g, '') // Remove $, commas, parentheses
        .replace(/,(\d{3})/g, '$1') // Handle comma separators
        .trim()
      
      const num = Number(cleaned)
      return isNaN(num) ? null : num
    })
    const validNumbers = numberValues.filter(v => v !== null)
    // Column is numeric if 90% or more of non-empty values are numeric
    const isNumber = nonEmpty.length > 0 && (validNumbers.length / nonEmpty.length) >= 0.9

    // Test for dates - only if not already a number
    let isDate = false
    if (!isNumber) {
      const datePatterns = /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$|^\d{4}[-/]\d{1,2}[-/]\d{1,2}$|^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-\s]\d{1,2}|^(January|February|March|April|May|June|July|August|September|October|November|December)[-\s]\d{1,2}$/i
      const validDates = nonEmpty.filter(v => {
        const str = String(v).trim()
        // Check common date patterns first
        if (datePatterns.test(str)) return true
        // Then try Date.parse
        const time = Date.parse(str)
        return !isNaN(time) && isNaN(Number(str)) && time > 0
      })
      isDate = validDates.length === nonEmpty.length && nonEmpty.length > 0
    }

    // Test for categorical - limited unique values
    const uniqueValues = Array.from(new Set(nonEmpty.map(String)))
    const percentUnique = (uniqueValues.length / nonEmpty.length) * 100
    const isCategorical = percentUnique <= 50 && uniqueValues.length <= Math.min(20, Math.max(5, Math.floor(sample.length / 2))) && !isNumber && !isDate

    let type = "text"
    if (isNumber) type = "number"
    else if (isDate) type = "date"
    else if (isCategorical) type = "categorical"

    return {
      name: col,
      type,
      sample: nonEmpty.length > 0 ? String(nonEmpty[0]) : "",
      use: type !== "text",
      stats: {
        validCount: nonEmpty.length,
        total: values.length,
        uniqueCount: uniqueValues.length,
        percentFilled: Math.round((nonEmpty.length / values.length) * 100)
      }
    }
  })
}

const suggestChart = (colsMeta, selectedX, selectedY) => {
  const xMeta = colsMeta.find((c) => c.name === selectedX)
  const yMeta = colsMeta.find((c) => c.name === selectedY)

  // If user has selected specific columns
  if (xMeta && yMeta) {
    if (xMeta.type === "date" && yMeta.type === "number") return { type: "line", reason: "time series data", x: xMeta.name, y: yMeta.name }
    if (xMeta.type === "categorical" && yMeta.type === "number") return { type: "bar", reason: "categorical comparison", x: xMeta.name, y: yMeta.name }
    if (xMeta.type === "number" && yMeta.type === "number") return { type: "scatter", reason: "correlation analysis", x: xMeta.name, y: yMeta.name }
    if (yMeta.type === "number") return { type: "bar", reason: "numeric analysis", x: xMeta.name, y: yMeta.name }
  }

  // Auto-suggest based on available columns
  if (!xMeta && !yMeta) {
    const dateCol = colsMeta.find((c) => c.type === "date")
    const numberCols = colsMeta.filter((c) => c.type === "number")
    const categoricalCols = colsMeta.filter((c) => c.type === "categorical")
    const textCols = colsMeta.filter((c) => c.type === "text")
    
    // Priority 1: Date + Number = Line chart (time series)
    if (dateCol && numberCols.length > 0) {
      return { type: "line", reason: "time series data", x: dateCol.name, y: numberCols[0].name }
    }
    
    // Priority 2: Category + Number = Bar chart
    if (categoricalCols.length > 0 && numberCols.length > 0) {
      return { type: "bar", reason: "categorical analysis", x: categoricalCols[0].name, y: numberCols[0].name }
    }
    
    // Priority 3: Multiple numbers = Scatter chart
    if (numberCols.length >= 2) {
      return { type: "scatter", reason: "correlation analysis", x: numberCols[0].name, y: numberCols[1].name }
    }
    
    // Priority 4: Single number = Bar chart with its value
    if (numberCols.length === 1 && (categoricalCols.length > 0 || textCols.length > 0)) {
      const textCol = categoricalCols[0] || textCols[0]
      return { type: "bar", reason: "data analysis", x: textCol.name, y: numberCols[0].name }
    }
    
    // Priority 5: Only categorical columns = Frequency/Count chart
    if (categoricalCols.length > 0 && numberCols.length === 0) {
      return { 
        type: "pie", 
        reason: "categorical distribution",
        x: categoricalCols[0].name,
        y: null,
        viewType: "frequency"
      }
    }
    
    // Priority 6: Only dates = Timeline view
    if (dateCol && numberCols.length === 0 && categoricalCols.length === 0) {
      return { 
        type: "table", 
        reason: "date-only dataset - use data explorer",
        x: dateCol.name,
        viewType: "timeline"
      }
    }
    
    // Fallback: No suitable numeric columns - suggest data explorer
    return { 
      type: "table", 
      reason: "no numeric columns - use data explorer",
      viewType: "explorer"
    }
  }

  // If only one axis selected, find the other
  if (xMeta && !yMeta) {
    const numberCols = colsMeta.filter((c) => c.type === "number")
    if (numberCols.length > 0) {
      return { type: "bar", reason: "numeric analysis", x: xMeta.name, y: numberCols[0].name }
    }
  }

  if (yMeta && !xMeta) {
    const categoricalCols = colsMeta.filter((c) => c.type === "categorical" || c.type === "text")
    if (categoricalCols.length > 0 && yMeta.type === "number") {
      return { type: "bar", reason: "comparison analysis", x: categoricalCols[0].name, y: yMeta.name }
    }
  }

  return { 
    type: "table", 
    reason: "no suitable columns - use data explorer",
    viewType: "explorer"
  }
}

const buildChartData = (rows, xcol, ycol, chartType, colsMeta) => {
  if (!rows || rows.length === 0) return null
  
  // Validate that required columns exist
  if (!xcol || !ycol) {
    if (chartType !== 'pie') return null
  }

  const xMeta = colsMeta.find((c) => c.name === xcol)
  const yMeta = colsMeta.find((c) => c.name === ycol)

  const chartColors = {
    primary: "rgb(99, 102, 241)",
    secondary: "rgb(139, 92, 246)",
    success: "rgb(34, 197, 94)",
    danger: "rgb(239, 68, 68)"
  }

  if (chartType === "pie") {
    const bgColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"]
    if (xMeta && xMeta.type === "categorical" && yMeta && yMeta.type === "number") {
      const grouped = {}
      rows.forEach((r) => {
        const k = String(r[xcol])
        const v = Number(r[ycol]) || 0
        grouped[k] = (grouped[k] || 0) + v
      })
      const labels = Object.keys(grouped)
      const data = Object.values(grouped)
      return {
        labels,
        datasets: [{
          data,
          backgroundColor: bgColors.slice(0, labels.length),
          borderColor: "#fff",
          borderWidth: 2
        }]
      }
    }
    const counts = {}
    rows.forEach((r) => {
      const k = String(r[xcol] ?? r[ycol] ?? "unknown")
      counts[k] = (counts[k] || 0) + 1
    })
    const labels = Object.keys(counts)
    const data = Object.values(counts)
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: bgColors.slice(0, labels.length),
        borderColor: "#fff",
        borderWidth: 2
      }]
    }
  }

  if (chartType === "scatter") {
    const data = rows.map((r) => {
      const x = Number(r[xcol])
      const y = Number(r[ycol])
      if (isNaN(x) || isNaN(y)) return null
      return { x, y }
    }).filter(Boolean)
    return {
      datasets: [{
        label: `${ycol} vs ${xcol}`,
        data,
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: chartColors.primary,
        borderWidth: 2
      }]
    }
  }

  if (chartType === "line") {
    let points = rows.map((r) => ({ x: r[xcol], y: Number(r[ycol]) }))
    if (xMeta && xMeta.type === "date") {
      points = points.map((p) => ({ x: new Date(p.x).getTime(), y: p.y })).filter((p) => !isNaN(p.x))
      return {
        datasets: [{
          label: ycol,
          data: points.map((p) => ({ x: p.x, y: p.y })),
          fill: true,
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          borderColor: chartColors.primary,
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: chartColors.primary
        }]
      }
    }

    const labels = rows.map((r) => String(r[xcol]))
    const data = rows.map((r) => Number(r[ycol]) || 0)
    return {
      labels,
      datasets: [{
        label: ycol,
        data,
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        borderColor: chartColors.primary,
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: chartColors.primary
      }]
    }
  }

  if (chartType === "bar") {
    if (xMeta && xMeta.type === "categorical" && yMeta && yMeta.type === "number") {
      const grouped = {}
      rows.forEach((r) => {
        const k = String(r[xcol])
        const v = Number(r[ycol]) || 0
        grouped[k] = (grouped[k] || 0) + v
      })
      const labels = Object.keys(grouped)
      const data = Object.values(grouped)
      return {
        labels,
        datasets: [{
          label: ycol,
          data,
          backgroundColor: "rgba(99, 102, 241, 0.7)",
          borderColor: chartColors.primary,
          borderWidth: 2,
          borderRadius: 6
        }]
      }
    }

    const labels = rows.map((r) => String(r[xcol] ?? ""))
    const data = rows.map((r) => Number(r[ycol]) || 0)
    return {
      labels,
      datasets: [{
        label: ycol,
        data,
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderColor: chartColors.primary,
        borderWidth: 2,
        borderRadius: 6
      }]
    }
  }
  return null
}

export default forwardRef(function UploadZone({ onStatsUpdate }, ref) {
  const [fileError, setFileError] = useState("")
  const [rows, setRows] = useState([])
  const [colsMeta, setColsMeta] = useState([])
  const [fileName, setFileName] = useState("")
  const [loading, setLoading] = useState(false)
  const [autoGenerateCharts, setAutoGenerateCharts] = useState(false)
  const [isFromSampleDataset, setIsFromSampleDataset] = useState(false)

  const [selectedX, setSelectedX] = useState("")
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedY, setSelectedY] = useState("")
  const [suggestion, setSuggestion] = useState(null)
  const [chosenChart, setChosenChart] = useState(null)
  const [showSuggestionBox, setSuggestionBox] = useState(false)

  const fileInfoRef = useRef(null)

  const MAX_SIZE_MB = 5
  const SUPPORTED_TYPES = ["text/csv", "application/json", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"]

  // Scroll to top when charts are generated
  useEffect(() => {
    if (autoGenerateCharts && rows.length > 0 && fileInfoRef.current) {
      setTimeout(() => {
        fileInfoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [autoGenerateCharts, rows.length])

  // Expose loadFile method via ref
  useImperativeHandle(ref, () => ({
    loadFile: async (file) => {
      if(isProcessing){
        toast.error("Already processing a file. Please wait.");
        return;
      }
      // Reset state before loading new file
      setRows([])
      setColsMeta([])
      setSelectedX("")
      setSelectedY("")
      setSuggestion(null)
      setChosenChart(null)
      setSuggestionBox(false)
      setAutoGenerateCharts(false)
      
      setFileName(file.name)
      // Ensure we have the correct file type
      let processFile = file
      if (file.name.endsWith('.json')) {
        processFile = new File([file], file.name, { type: 'application/json' })
      } else if (file.name.endsWith('.csv')) {
        processFile = new File([file], file.name, { type: 'text/csv' })
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processFile = new File([file], file.name, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      }
      setIsFromSampleDataset(true)
      await parseFile(processFile, true)
      setAutoGenerateCharts(true)
    }
  }))

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setFileError("")
    setRows([])
    setColsMeta([])
    setSelectedX("")
    setSelectedY("")
    setSuggestion(null)
    setChosenChart(null)
    setAutoGenerateCharts(false)
    setIsFromSampleDataset(false)

    if (rejectedFiles.length > 0) {
      toast.error("Invalid file or size (max 5MB)")
      return
    }
    const file = acceptedFiles[0]
    if (file) {
      setFileName(file.name)
      parseFile(file, false)
      // Show suggestion box for manually uploaded files
      setTimeout(() => {
        setSuggestionBox(true)
      }, 100)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"]
    },
    onDrop
  })

const parseFile = async (file, isSampleDataset = false) => {
  setLoading(true);
  try {
    // Step 1: Validate file
    const validation = validateFile(file, MAX_SIZE_MB);
    if (!validation.valid) {
      validation.errors.forEach(err => toast.error(err));
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      const error = new AppError('Failed to read file', 400, 'FILE_READ_ERROR');
      errorHandler(error, toast);
      setLoading(false);
    };

    // CSV Processing
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      reader.onload = () => {
        const txt = reader.result;
        Papa.parse(txt, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (res) => {
            try {
              // Validate CSV data
              validateCSVData(res.data);
              
              // Clean headers
              const cleanedData = res.data.map(row => {
                const cleanedRow = {};
                Object.keys(row).forEach(key => {
                  const cleanedKey = key.trim();
                  cleanedRow[cleanedKey] = row[key];
                });
                return cleanedRow;
              });

              setRows(cleanedData);
              const meta = detectColumnsFromData(cleanedData);
              setColsMeta(meta);
              console.log('🔍 Column Detection Results:', {
                fileName: file.name,
                totalRecords: cleanedData.length,
                columns: meta.map(m => ({ name: m.name, type: m.type, sample: m.sample }))
              });
              // Don't pre-populate suggestion or X/Y axis for manual uploads
              setSuggestion(null);
              setSelectedX("");
              setSelectedY("");
              // Only show suggestion box for manual uploads
              if (!isSampleDataset) {
                setSuggestionBox(true);
              }
              
              if (onStatsUpdate) {
                onStatsUpdate({
                  filesCount: (parseInt(localStorage.getItem("filesCount")) || 0) + 1,
                  chartsCount: parseInt(localStorage.getItem("chartsCount")) || 0,
                  recordsCount: cleanedData.length,
                  storageUsed: ((file.size / 1024 / 1024).toFixed(2)) + " MB"
                });
              }
              
              toast.success(`Successfully loaded ${cleanedData.length} records!`);
              setLoading(false);
            } catch (err) {
              errorHandler(err, toast);
              setLoading(false);
            }
          },
          error: (err) => {
            const error = new AppError(`CSV parse error: ${err.message}`, 400, 'PARSE_ERROR');
            errorHandler(error, toast);
            setLoading(false);
          }
        });
      };
      reader.readAsText(file);
      return;
    }

    // JSON Processing
    if (file.type === "application/json" || file.name.endsWith(".json")) {
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result);
          // Validate JSON data
          validateJSONData(json);
          const dataArr = Array.isArray(json) ? json : json.data || [];    
          setRows(dataArr);
          const meta = detectColumnsFromData(dataArr);
          setColsMeta(meta);
          console.log('🔍 Column Detection Results (JSON):', {
            fileName: file.name,
            totalRecords: dataArr.length,
            columns: meta.map(m => ({ name: m.name, type: m.type, sample: m.sample }))
          });
          // Don't pre-populate suggestion or X/Y axis for manual uploads
          setSuggestion(null);
          setSelectedX("");
          setSelectedY("");
          // Only show suggestion box for manual uploads
          if (!isSampleDataset) {
            setSuggestionBox(true);
          }
          
          if (onStatsUpdate) {
            onStatsUpdate({
              filesCount: (parseInt(localStorage.getItem("filesCount")) || 0) + 1,
              chartsCount: parseInt(localStorage.getItem("chartsCount")) || 0,
              recordsCount: dataArr.length,
              storageUsed: ((file.size / 1024 / 1024).toFixed(2)) + " MB"
            });
          }
          toast.success(`Successfully loaded ${dataArr.length} records!`);
          setLoading(false);
        } catch (err) {
          if (err instanceof SyntaxError) {
            const error = new AppError('Invalid JSON format', 400, 'PARSE_ERROR');
            errorHandler(error, toast);
          } else {
            errorHandler(err, toast);
          }
          setLoading(false);
        }
      };
      reader.readAsText(file);
      return;
    }

    // Excel Processing
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        if (!data || data.length === 0) {
          throw new AppError('Excel file is empty', 400, 'VALIDATION_ERROR');
        }
        setRows(data);
        const meta = detectColumnsFromData(data);
        setColsMeta(meta);
        console.log('🔍 Column Detection Results (Excel):', {
          fileName: file.name,
          totalRecords: data.length,
          columns: meta.map(m => ({ name: m.name, type: m.type, sample: m.sample }))
        });
        // Don't pre-populate suggestion or X/Y axis for manual uploads
        setSuggestion(null);
        setSelectedX("");
        setSelectedY("");
        // Only show suggestion box for manual uploads
        if (!isSampleDataset) {
          setSuggestionBox(true);
        }
        
        if (onStatsUpdate) {
          onStatsUpdate({
            filesCount: (parseInt(localStorage.getItem("filesCount")) || 0) + 1,
            chartsCount: parseInt(localStorage.getItem("chartsCount")) || 0,
            recordsCount: data.length,
            storageUsed: ((file.size / 1024 / 1024).toFixed(2)) + " MB"
          });
        }
        
        toast.success(`Successfully loaded ${data.length} records!`);
        setLoading(false);
      } catch (err) {
        const error = new AppError('Excel parsing failed', 400, 'PARSE_ERROR');
        errorHandler(error, toast);
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
    
  } catch (err) {
    errorHandler(err, toast);
    setLoading(false);
  }
};
  const onColumnConfirm = () => {
    const s = suggestChart(colsMeta, selectedX, selectedY)
    setSuggestion(s)
    setSuggestionBox(true)
    setChosenChart(null)
  }

  const acceptSuggestion = () => {
    if (!suggestion || !selectedX || !selectedY) {
      toast.error("Please select both X and Y axis columns")
      return
    }
    // Recalculate suggestion based on current selections before generating chart
    const updatedSuggestion = suggestChart(colsMeta, selectedX, selectedY)
    setSuggestion(updatedSuggestion)
    setChosenChart(updatedSuggestion.type)
    setSuggestionBox(false)
    toast.success(`Generating ${updatedSuggestion.type.toUpperCase()} chart...`)
  }

  const chooseChartType = (type) => {
    if (!selectedX || !selectedY) {
      toast.error("Please select both X and Y axis columns first")
      return
    }
    // Update suggestion to reflect the chosen type
    const updatedSuggestion = { ...suggestion, type }
    setSuggestion(updatedSuggestion)
    setChosenChart(type)
    setSuggestionBox(false)
  }

  const chartData = useMemo(() => {
    if (!chosenChart || !rows.length) return null
    try {
      const data = buildChartData(rows, suggestion?.x || selectedX, suggestion?.y || selectedY, chosenChart, colsMeta)
      // Validate chart data structure
      if (!data || !data.datasets || !Array.isArray(data.datasets) || data.datasets.length === 0) {
        return null
      }
      // Ensure all datasets have valid data arrays
      const validData = data.datasets.every(ds => Array.isArray(ds.data) || (ds.data && typeof ds.data === 'object'))
      if (!validData) return null
      return data
    } catch (err) {
      console.error('Error building chart data:', err)
      return null
    }
  }, [chosenChart, rows, colsMeta, suggestion, selectedX, selectedY])

  // Determine if we have numeric columns for chart suggestions
  const hasNumericColumns = colsMeta.some(col => col.type === 'number')
  const hasCategoricalColumns = colsMeta.some(col => col.type === 'categorical')
  const hasDateColumns = colsMeta.some(col => col.type === 'date')

  // Recalculate chart suggestion when user selects X/Y axis
  useEffect(() => {
    if (selectedX && selectedY && colsMeta.length > 0 && !isFromSampleDataset) {
      const newSuggestion = suggestChart(colsMeta, selectedX, selectedY)
      setSuggestion(newSuggestion)
      console.log('📊 Chart Suggestion (Updated):', newSuggestion)
    } else if ((!selectedX || !selectedY) && !isFromSampleDataset) {
      // Clear suggestion if X or Y is not selected
      setSuggestion(null)
    }
  }, [selectedX, selectedY, colsMeta, isFromSampleDataset])

  // Scroll to file info when file is loaded
  useEffect(() => {
    if (rows.length > 0 && fileInfoRef.current) {
      setTimeout(() => {
        fileInfoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [rows.length])

  return (
    <div className="space-y-6">
      {/* File Info Section - Show filename and record count after upload */}
      {rows.length > 0 && (
        <div ref={fileInfoRef} className="mb-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            File: <span className="font-semibold text-gray-900 dark:text-white">{fileName}</span> • 
            <span className="font-semibold text-gray-900 dark:text-white ml-1">{rows.length}</span> records
          </p>
        </div>
      )}

      {/* Column Detection Section */}
      {colsMeta.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="dark:bg-gray-800 bg-white rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="p-2 bg-blue-500/20 rounded-lg">
              <CheckCircle className="text-blue-500" size={20} />
            </span>
            Column Detection
          </h3>

          {/* Columns Table View */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Column Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Sample Value</th>
                </tr>
              </thead>
              <tbody>
                {colsMeta.map((col, idx) => (
                  <tr key={idx} className={`border-b border-gray-200 dark:border-gray-700 ${
                    idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
                  }`}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{col.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        col.type === 'number' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        col.type === 'date' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                        col.type === 'categorical' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}>
                        {col.type === 'number' && '📊 Numeric'}
                        {col.type === 'date' && '📅 Date'}
                        {col.type === 'categorical' && '🏷️ Category'}
                        {col.type === 'text' && '📝 Text'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">
                      {col.sample || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No numeric columns warning */}
          {!hasNumericColumns && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg flex gap-3"
            >
              <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">No numeric columns detected</p>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                  Charts require at least one numeric column. Consider uploading data with numbers, dates, or more distinct categories.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Chart Suggestion Box */}
      {showSuggestionBox && colsMeta.length > 0 && hasNumericColumns && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden rounded-xl border-2 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-300 dark:border-indigo-700 shadow-lg"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-10 blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Chart Suggestion</h3>
            
            {/* Axis Selection for Custom Charts */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">X-Axis</label>
                <select
                  value={selectedX}
                      onChange={(e) => setSelectedX(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select column...</option>
                      {colsMeta.map((col) => (
                        <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Y-Axis</label>
                    <select
                      value={selectedY}
                      onChange={(e) => setSelectedY(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select column...</option>
                      {colsMeta.map((col) => (
                        <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Suggestion Text Line - Shown after user selects X/Y */}
                {suggestion && selectedX && selectedY && (
                  <div className="my-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700">
                    <p className="text-sm text-indigo-900 dark:text-indigo-200">
                      💡 I suggest a <span className="font-bold uppercase text-indigo-700 dark:text-indigo-300">{suggestion.type}</span> chart for your <span className="font-semibold">{selectedX}</span> and <span className="font-semibold">{selectedY}</span> data
                    </p>
                  </div>
                )}

                {/* Chart Type Selector */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Choose a chart type:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['line', 'bar', 'pie', 'scatter'].map((type) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => chooseChartType(type)}
                        className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all uppercase ${
                          suggestion && suggestion.type === type
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-indigo-500'
                        }`}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={acceptSuggestion}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Generate Chart
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSuggestionBox(false)}
                    className="py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
          </div>
        </motion.div>
      )}

      {/* Multi-Chart Grid for Sample Datasets */}
      {isFromSampleDataset && rows.length > 0 && colsMeta.length > 0 && !chosenChart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MultiChartGrid 
            rows={rows} 
            colsMeta={colsMeta} 
            autoGenerated={true}
            fileName={fileName}
            recordCount={rows.length}
          />
        </motion.div>
      )}

      {/* Chart Preview */}
      {chosenChart && chartData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="dark:bg-gray-800 bg-white rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {chosenChart.toUpperCase()} Chart Preview
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setChosenChart(null)
                setSuggestionBox(true)
              }}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>

          <div className="relative h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 flex items-center justify-center">
            {chosenChart === 'line' && chartData && (
              <Line 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            )}
            {chosenChart === 'bar' && chartData && (
              <Bar 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            )}
            {chosenChart === 'pie' && chartData && (
              <Pie 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }} 
              />
            )}
            {chosenChart === 'scatter' && chartData && (
              <Scatter 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true }
                  }
                }} 
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Data Explorer - For categorical/text only datasets */}
      {rows.length > 0 && !hasNumericColumns && !chosenChart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="dark:bg-gray-800 bg-white rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Table size={20} className="text-green-500" />
              Data Explorer
            </h3>
            <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
              {rows.length} records
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This dataset contains only categorical/text columns. Below is a preview of your data:
          </p>

          {/* Data Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  {colsMeta.map((col) => (
                    <th key={col.name} className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span>{col.name}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          col.type === 'categorical' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          col.type === 'date' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                          'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {col.type}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className={`border-b border-gray-200 dark:border-gray-700 ${
                    idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
                  }`}>
                    {colsMeta.map((col) => (
                      <td key={`${idx}-${col.name}`} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {String(row[col.name] || '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length > 10 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Showing 10 of {rows.length} records
            </p>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
              <strong>💡 Suggestions:</strong>
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
              <li>Create custom categories by grouping related values</li>
              <li>Count occurrences of categories to create frequency charts</li>
              <li>Cross-tabulate two categorical columns for comparison</li>
              <li>Export this data to add computed numeric columns</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* Upload Zone - Always show, with different styling when charts exist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: autoGenerateCharts && rows.length > 0 ? 0.3 : 0 }}
        {...getRootProps()}
        className={`relative overflow-hidden rounded-xl p-12 text-center cursor-pointer transition-all border-2 border-dashed
          ${isDragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:border-indigo-400"
          }`}>
        <input {...getInputProps()} />
        <div className="relative z-10">
          <motion.div
            animate={{ scale: isDragActive ? 1.1 : 1 }}
            className="inline-block p-4 bg-white dark:bg-gray-800 rounded-full mb-4"
          >
            {loading ? (
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className={`w-8 h-8 ${isDragActive ? "text-indigo-600" : "text-gray-600 dark:text-gray-300"}`} />
            )}
          </motion.div>
          {loading ? (
            <p className="text-indigo-600 font-semibold">Processing file...</p>
          ) :  isDragActive ? (
            <p className="text-indigo-600 font-semibold">Drop your file here...</p>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-1">
                {autoGenerateCharts && rows.length > 0 ? "Upload Another File" : "Drag & drop your data file here"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">or click to select (CSV, JSON, Excel • max 5MB)</p>
            </>
          )}
        </div>  
      </motion.div>
    </div>
  )
})
