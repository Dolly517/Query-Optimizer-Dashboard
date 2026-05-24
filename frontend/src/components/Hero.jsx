import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, TrendingUp, Shield, ArrowRight, Sparkles, Database, BarChart3 } from 'lucide-react'

const stats = [
  { value: '10+', label: 'Issue Detectors' },
  { value: '100', label: 'Point Scoring' },
  { value: '0', label: 'API Cost' },
  { value: '< 1s', label: 'Analysis Time' },
]

export default function Hero() {
  const navigate = useNavigate()
  return (
    <section className="relative pt-24 pb-20 hero-gradient overflow-hidden" id="home">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-20 w-60 h-60 bg-cyan-200/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-40 bg-blue-100/40 rounded-full blur-2xl" />

        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">AI-Powered · Rule-Based Engine · Zero Cost</span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6 animate-slide-up">
            Optimize Your SQL<br />
            <span className="gradient-text">Queries with AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in" style={{animationDelay:'0.15s'}}>
            QueryMind AI analyzes your SQL queries in real-time, detects performance bottlenecks,
            recommends indexes, and generates optimized query suggestions — no API key required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16 animate-fade-in" style={{animationDelay:'0.25s'}}>
            <button
              onClick={() => navigate('/analyze')}
              className="group flex items-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:shadow-xl transition-all duration-200"
            >
              <Zap className="w-5 h-5" />
              Start Analyzing Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button
              onClick={() => navigate('/analyze')}
              className="flex items-center gap-2.5 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Database className="w-5 h-5 text-blue-500" />
              View Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in" style={{animationDelay:'0.35s'}}>
            {stats.map(stat => (
              <div key={stat.label} className="text-center p-4 bg-white/70 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-3xl font-extrabold text-blue-600 mb-1">{stat.value}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{animationDelay:'0.45s'}}>
          {[
            { icon: Shield, text: 'Performance Score' },
            { icon: TrendingUp, text: 'Index Recommendations' },
            { icon: BarChart3, text: 'Risk Assessment' },
            { icon: Zap, text: 'Optimized Query Generation' },
            { icon: Database, text: 'Schema Analysis' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-medium text-slate-600">
              <Icon className="w-3.5 h-3.5 text-blue-500" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
