import React from 'react'
import { ArrowRight, Shield, Zap, Database, Code2 } from 'lucide-react'

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold mb-5">
            <Code2 className="w-4 h-4" />
            Open Source SQL Optimization Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-5">
            About QueryMind AI
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            QueryMind AI is a rule-based SQL query analyzer built to help developers and DBAs write faster,
            cleaner, and more efficient queries without expensive profiling tools or cloud subscriptions.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Shield, title: 'Performance Insights', text: 'Detect full table scans, missing indexes, and risky query patterns before they slow your app down.' },
            { icon: Zap, title: 'Fast Rule-Based Analysis', text: 'No API keys or external model calls. QueryMind AI evaluates SQL locally using deterministic rules.' },
            { icon: Database, title: 'Schema-Aware Optimization', text: 'Read CREATE TABLE statements to identify indexed columns and suggest better access paths.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What it does</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                QueryMind AI analyzes SQL statements, calculates a performance score, recommends indexes, and generates
                optimized query suggestions. It is designed for developers who want practical feedback instead of generic advice.
              </p>
              <ul className="space-y-3 text-slate-700">
                {[
                  '10+ SQL issue detectors like SELECT *, missing WHERE, too many JOINs, and more',
                  'Performance score out of 100 with risk-level classification',
                  'Index recommendations with CREATE INDEX statements',
                  'Downloadable reports and file upload support for .sql files',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Built for</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600">
                {['Developers', 'DBAs', 'Students', 'Analysts', 'Teams', 'Learners'].map(item => (
                  <div key={item} className="px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="/analyze"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
          >
            Explore QueryMind AI
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </main>
  )
}
