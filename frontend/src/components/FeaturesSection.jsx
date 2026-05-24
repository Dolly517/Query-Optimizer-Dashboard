import React from 'react'
import {
  Zap, Shield, TrendingUp, Database, Code2, BarChart3,
  Eye, Target, Lightbulb, Clock, FileSearch, Download
} from 'lucide-react'

const features = [
  {
    icon: Eye,
    color: 'blue',
    title: 'SELECT * Detection',
    description: 'Instantly flags SELECT * usage and recommends specifying only the columns you need to reduce I/O and memory usage.',
  },
  {
    icon: Shield,
    color: 'emerald',
    title: 'Missing WHERE Clause',
    description: 'Detects full-table scans caused by missing WHERE clauses and warns you before your database grinds to a halt.',
  },
  {
    icon: Database,
    color: 'purple',
    title: 'JOIN Complexity Analysis',
    description: 'Counts and evaluates JOIN chains, flagging excessive joins (5+) that cause exponential query plan complexity.',
  },
  {
    icon: TrendingUp,
    color: 'amber',
    title: 'Smart Index Recommendations',
    description: 'Analyzes your schema for missing indexes on WHERE, JOIN ON, ORDER BY, and GROUP BY columns. Generates CREATE INDEX statements.',
  },
  {
    icon: Zap,
    color: 'red',
    title: 'LIKE Pattern Analysis',
    description: "Detects leading wildcards (LIKE '%keyword') that prevent index usage, and suggests FULLTEXT search as an alternative.",
  },
  {
    icon: Code2,
    color: 'cyan',
    title: 'Subquery Depth Detection',
    description: 'Identifies nested subqueries that re-execute for each row and suggests CTE or JOIN rewrites for better performance.',
  },
  {
    icon: BarChart3,
    color: 'indigo',
    title: 'Performance Score (0–100)',
    description: 'Each query receives a score out of 100 based on detected issues, weighted by severity — Good, Medium, High Risk, or Critical.',
  },
  {
    icon: Target,
    color: 'pink',
    title: 'Optimized Query Generation',
    description: 'Automatically generates an improved version of your query with inline comments explaining each optimization applied.',
  },
  {
    icon: Lightbulb,
    color: 'orange',
    title: 'ORDER BY / GROUP BY Checks',
    description: 'Verifies that ORDER BY and GROUP BY columns are covered by indexes to prevent filesort and temporary table operations.',
  },
  {
    icon: FileSearch,
    color: 'teal',
    title: 'SQL File Upload',
    description: 'Upload a .sql file and QueryMind automatically parses it, separating CREATE TABLE schema from SELECT queries.',
  },
  {
    icon: Clock,
    color: 'slate',
    title: 'LIMIT Clause Reminder',
    description: 'Warns when queries lack a LIMIT clause, preventing accidental retrieval of millions of rows in production.',
  },
  {
    icon: Download,
    color: 'violet',
    title: 'Downloadable Reports',
    description: 'Export the full analysis as a formatted .txt report or machine-readable .json for documentation and CI integration.',
  },
]

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  red: 'bg-red-50 text-red-500 border-red-100',
  cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  orange: 'bg-orange-50 text-orange-500 border-orange-100',
  teal: 'bg-teal-50 text-teal-600 border-teal-100',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  violet: 'bg-violet-50 text-violet-600 border-violet-100',
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Features</span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            Everything You Need to
            <span className="gradient-text"> Optimize SQL</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            A comprehensive rule-based AI engine with 12 specialized detectors covering the most common
            SQL performance pitfalls encountered in production databases.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="card-hover group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${colorMap[feature.color]}`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center p-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-xl shadow-blue-200">
          <h3 className="text-3xl font-extrabold text-white mb-3">
            Ready to Optimize Your Queries?
          </h3>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
            No sign-up, no API key, no cost. Just paste your SQL and get instant insights.
          </p>
          <a
            href="#analyzer"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-blue-700 font-bold text-base rounded-xl shadow-lg hover:bg-blue-50 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Try It Now — It's Free
          </a>
        </div>
      </div>
    </section>
  )
}
