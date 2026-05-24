import React, { useState, useRef, useCallback } from 'react'
import axios from 'axios'
import {
  Play, Upload, FileText, Trash2, Download, Copy, CheckCheck,
  AlertTriangle, AlertCircle, Info, CheckCircle, Zap,
  TrendingUp, Shield, Clock, BarChart3, ChevronDown, ChevronUp,
  RefreshCw, Lightbulb, Code2, Target, X
} from 'lucide-react'
import AnalysisReport from './AnalysisReport.jsx'

const SAMPLE_QUERY = `SELECT * 
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id
JOIN categories cat ON p.category_id = cat.id
JOIN suppliers s ON p.supplier_id = s.id
WHERE o.status LIKE '%pending%'
  AND c.email LIKE '%@gmail.com'
ORDER BY o.created_at
GROUP BY c.id;`

// SAMPLE_SCHEMA removed — schema UI disabled per user request

export default function Analyzer() {
  const [query, setQuery] = useState('')
  const [schema, setSchema] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('query')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError('Please enter a SQL query to analyze.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data } = await axios.post('/api/analyze', { query, schema })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = useCallback(async (file) => {
    if (!file || !file.name.endsWith('.sql')) {
      setError('Please upload a valid .sql file.')
      return
    }
    setFileName(file.name)
    const formData = new FormData()
    formData.append('file', file)
    try {
      setLoading(true)
      const { data } = await axios.post('/api/parse-sql-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (data.query) setQuery(data.query)
      if (data.schema) setSchema(data.schema)
      setError(null)
    } catch (err) {
      setError('Failed to parse SQL file.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])

  const loadSample = () => {
    setQuery(SAMPLE_QUERY)
    setFileName(null)
    setResult(null)
    setError(null)
  }

  const clearAll = () => {
    setQuery('')
    setSchema('')
    setFileName(null)
    setResult(null)
    setError(null)
  }

  const copyQuery = async () => {
    if (result?.optimizedQuery) {
      await navigator.clipboard.writeText(result.optimizedQuery)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section id="analyzer" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Query Analyzer</span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Analyze Your SQL Query</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Paste your SQL query and get instant AI-powered optimization insights.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* ── LEFT PANEL ── */}
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
              {[
                { id: 'query', label: 'SQL Query', icon: Code2 },
                { id: 'upload', label: 'Upload File', icon: Upload },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* SQL Query Tab */}
            {activeTab === 'query' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700">SQL Query</span>
                    {query && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                        {query.split('\n').length} lines
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadSample}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Lightbulb className="w-3 h-3" />
                      Load Sample
                    </button>
                    {query && (
                      <button
                        onClick={() => setQuery('')}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <textarea
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={`-- Paste your SQL query here\nSELECT * FROM users WHERE email = 'test@example.com';`}
                    className="sql-editor w-full h-64 p-3 bg-slate-900 text-green-400 placeholder-slate-600 rounded-xl border-0 focus:ring-2 focus:ring-blue-500/40 outline-none resize-y text-sm leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* Schema Tab */}
            {/* Schema UI removed per user request */}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">Upload SQL File</span>
                </div>
                <div className="p-4">
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center h-52 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                      dragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
                    }`}
                  >
                    {fileName ? (
                      <>
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                          <FileText className="w-7 h-7 text-blue-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">{fileName}</p>
                        <p className="text-xs text-slate-400 mt-1">File loaded successfully</p>
                        <p className="text-xs text-blue-500 mt-2 font-medium">Click to replace</p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                          <Upload className="w-7 h-7 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Drop your .sql file here</p>
                        <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                        <div className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                          Choose File
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".sql"
                    className="hidden"
                    onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0])}
                  />
                  <p className="text-xs text-slate-400 mt-3 text-center">
                    Accepts .sql files up to 5MB. CREATE TABLE statements will be parsed as schema.
                  </p>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Analysis Error</p>
                  <p className="text-sm text-red-600 mt-0.5">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick status preview */}
            {query && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  {query ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Query ready
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      No query
                    </div>
                  )}
                </div>
                
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={loading || !query.trim()}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-base font-bold transition-all duration-200 ${
                  loading || !query.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Analyze Query
                  </>
                )}
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-3.5 bg-white hover:bg-red-50 text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-xl font-semibold text-sm transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="space-y-4">
            {!result && !loading && (
              <EmptyState onLoadSample={() => { loadSample(); }} />
            )}
            {loading && <LoadingState />}
            {result && <AnalysisReport result={result} query={query} />}
          </div>
        </div>
      </div>
    </section>
  )
}

function EmptyState({ onLoadSample }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center animate-fade-in">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <BarChart3 className="w-10 h-10 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Analysis Report</h3>
      <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto mb-6">
        Your analysis results will appear here after you paste a SQL query and click "Analyze Query".
      </p>
      <button
        onClick={onLoadSample}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold rounded-xl border border-blue-200 transition-colors"
      >
        <Lightbulb className="w-4 h-4" />
        Try a Sample Query
      </button>

      {/* Preview cards */}
      <div className="mt-8 grid grid-cols-2 gap-3 text-left">
        {[
          { icon: Shield, label: 'Performance Score', preview: '— / 100', color: 'blue' },
          { icon: Target, label: 'Risk Level', preview: '—', color: 'emerald' },
          { icon: AlertTriangle, label: 'Issues Found', preview: '—', color: 'amber' },
          { icon: TrendingUp, label: 'Index Suggestions', preview: '—', color: 'purple' },
        ].map(({ icon: Icon, label, preview, color }) => (
          <div key={label} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className={`w-7 h-7 bg-${color}-50 rounded-lg flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 text-${color}-500`} />
            </div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-sm font-bold text-slate-300 mt-0.5">{preview}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center animate-fade-in">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-40" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
          <Zap className="w-10 h-10 text-white animate-pulse" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">Analyzing Query…</h3>
      <p className="text-slate-500 text-sm mb-6">Running rule-based AI engine on your SQL…</p>
      <div className="space-y-2.5 max-w-xs mx-auto">
        {['Parsing SQL structure', 'Detecting performance issues', 'Generating recommendations', 'Calculating performance score'].map((step, i) => (
          <div key={step} className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{ animationDelay: `${i * 0.1}s` }} />
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}
