import React, { useState } from 'react'
import {
  Shield, AlertTriangle, AlertCircle, Info, CheckCircle, TrendingUp,
  Download, Copy, CheckCheck, ChevronDown, ChevronUp, Database,
  Code2, Target, Zap, BarChart3, Clock, Award, Bot, Brain,
  ListChecks, Activity, Sparkles, Gauge
} from 'lucide-react'

const SEVERITY_CONFIG = {
  Critical: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500'
  },
  High: {
    icon: AlertTriangle,
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    dot: 'bg-orange-500'
  },
  Medium: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500'
  },
  Low: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-400'
  },
  Info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-400'
  }
}

const RISK_CONFIG = {
  Good: {
    gradient: 'from-emerald-400 to-emerald-500',
    textColor: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle
  },
  Medium: {
    gradient: 'from-amber-400 to-amber-500',
    textColor: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: AlertTriangle
  },
  'High Risk': {
    gradient: 'from-orange-400 to-orange-500',
    textColor: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: AlertTriangle
  },
  Critical: {
    gradient: 'from-red-500 to-red-600',
    textColor: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertCircle
  }
}

function ScoreRing({ score }) {
  const safeScore = Number(score || 0)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (safeScore / 100) * circumference

  const color =
    safeScore >= 85 ? '#10b981' :
    safeScore >= 65 ? '#f59e0b' :
    safeScore >= 40 ? '#f97316' :
    '#ef4444'

  const trackColor =
    safeScore >= 85 ? '#d1fae5' :
    safeScore >= 65 ? '#fef3c7' :
    safeScore >= 40 ? '#ffedd5' :
    '#fee2e2'

  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke={trackColor} strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-900 leading-none">{safeScore}</span>
        <span className="text-xs font-semibold text-slate-400 mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

function ConfidenceBar({ confidence }) {
  const value = Number(confidence || 0)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-500">Agent Confidence</span>
        <span className="text-xs font-bold text-blue-700">{value}%</span>
      </div>

      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}

function IssueCard({ issue, index }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.Low
  const Icon = cfg.icon

  return (
    <div
      className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-all duration-200 animate-fade-in`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div
        className="flex items-start gap-3 p-3.5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${cfg.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${cfg.text}`}>{issue.title}</span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${cfg.badge}`}>
              {issue.severity}
            </span>
          </div>

          {!expanded && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {issue.description}
            </p>
          )}
        </div>

        <button className={`${cfg.text} flex-shrink-0 mt-0.5`}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className={`px-4 pb-3.5 pt-0 border-t ${cfg.border} bg-white/50`}>
          <p className="text-sm text-slate-600 leading-relaxed">{issue.description}</p>

          {issue.fix && (
            <div className="mt-3 p-3 rounded-xl bg-white border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Suggested Fix</p>
              <p className="text-sm text-slate-700">{issue.fix}</p>
            </div>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs font-mono px-2 py-1 rounded-lg ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
              {issue.code}
            </span>
            <span className="text-xs text-slate-400">Issue Code</span>
          </div>
        </div>
      )}
    </div>
  )
}

function AgentCard({ result }) {
  const agent = result.agent || {}
  const summary = agent.summary || {}
  const reasoning = agent.reasoning || []
  const actionPlan = agent.actionPlan || []
  const confidence = agent.confidence || 0
  const impact = result.impact || {}

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 rounded-2xl shadow-sm p-5 text-white overflow-hidden relative">
        <div className="absolute right-[-40px] top-[-40px] w-32 h-32 rounded-full bg-white/10 blur-sm" />
        <div className="absolute right-10 bottom-[-50px] w-28 h-28 rounded-full bg-cyan-300/10 blur-sm" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <Bot className="w-6 h-6 text-cyan-200" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold">QueryMind AI Agent</h3>
              <p className="text-xs text-blue-100">
                {agent.mode || 'Rule-based SQL Optimization Agent'}
              </p>
            </div>
          </div>

          <p className="text-sm text-blue-50 leading-relaxed">
            {summary.summary || 'I analyzed your SQL query for bottlenecks, index opportunities, and production risk.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="rounded-xl bg-white/10 border border-white/15 p-3">
              <p className="text-xl font-extrabold">{summary.detectedProblems ?? result.issues?.length ?? 0}</p>
              <p className="text-xs text-blue-100">Problems</p>
            </div>

            <div className="rounded-xl bg-white/10 border border-white/15 p-3">
              <p className="text-xl font-extrabold">{summary.suggestedIndexes ?? result.indexes?.length ?? 0}</p>
              <p className="text-xs text-blue-100">Indexes</p>
            </div>

            <div className="rounded-xl bg-white/10 border border-white/15 p-3">
              <p className="text-xl font-extrabold">{summary.joinCount ?? result.metadata?.joinCount ?? 0}</p>
              <p className="text-xs text-blue-100">JOINs</p>
            </div>

            <div className="rounded-xl bg-white/10 border border-white/15 p-3">
              <p className="text-xl font-extrabold">{confidence}%</p>
              <p className="text-xs text-blue-100">Confidence</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-700">Agent Reasoning</h4>
        </div>

        <div className="space-y-3">
          {reasoning.length > 0 ? reasoning.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-extrabold text-indigo-600">{step.step || i + 1}</span>
              </div>

              <div className="flex-1 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <p className="text-sm font-bold text-slate-700">{step.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{step.detail}</p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-500">
              Reasoning data is not available. Update backend response to include agent.reasoning.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="w-4 h-4 text-emerald-500" />
          <h4 className="text-sm font-bold text-slate-700">Priority Action Plan</h4>
        </div>

        <div className="space-y-2.5">
          {actionPlan.length > 0 ? actionPlan.map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {item.priority || i + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-emerald-800 break-words">
                    {item.action}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    <span className="font-bold">Reason:</span> {item.reason}
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    <span className="font-bold">Benefit:</span> {item.expectedBenefit}
                  </p>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-500">No action plan generated.</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-bold text-slate-700">Confidence</h4>
          </div>

          <ConfidenceBar confidence={confidence} />

          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            Higher confidence means the agent had enough query and schema details to make stronger recommendations.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <h4 className="text-sm font-bold text-slate-700">Predicted Impact</h4>
          </div>

          {typeof impact === 'string' ? (
            <p className="text-sm text-slate-600 leading-relaxed">{impact}</p>
          ) : (
            <div>
              <div className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100 mb-2">
                {impact.level || 'Estimated'} Impact
              </div>
              <p className="text-sm font-bold text-slate-800">
                Improvement: {impact.estimatedImprovement || 'Depends on database'}
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {impact.explanation || 'Actual performance depends on table size, indexes, and database engine.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {result.explainPlanHint?.length > 0 && (
        <div className="bg-slate-900 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-cyan-300" />
            <h4 className="text-sm font-bold text-white">EXPLAIN Plan Prediction</h4>
          </div>

          <div className="space-y-2">
            {result.explainPlanHint.map((hint, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0 mt-0.5" />
                <span>{hint}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {agent.disclaimer && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">{agent.disclaimer}</p>
        </div>
      )}
    </div>
  )
}

export default function AnalysisReport({ result, query }) {
  const [copiedQuery, setCopiedQuery] = useState(false)
  const [activeSection, setActiveSection] = useState('agent')

  const riskCfg = RISK_CONFIG[result.riskLevel] || RISK_CONFIG.Medium
  const RiskIcon = riskCfg.icon

  const copyOptimized = async () => {
    await navigator.clipboard.writeText(result.optimizedQuery || '')
    setCopiedQuery(true)
    setTimeout(() => setCopiedQuery(false), 2000)
  }

  const downloadJSON = () => {
    const report = {
      title: 'QueryMind AI Agent Analysis Report',
      generatedAt: new Date().toISOString(),
      originalQuery: query,
      ...result
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `querymind-agent-report-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
  }

  const downloadText = () => {
    const agentSummary = result.agent?.summary?.summary || 'AI agent summary not available.'
    const actionPlan = result.agent?.actionPlan || []
    const impactText =
      typeof result.impact === 'string'
        ? result.impact
        : `${result.impact?.level || 'Estimated'} impact, improvement ${result.impact?.estimatedImprovement || 'depends on database'}. ${result.impact?.explanation || ''}`

    const lines = [
      '═══════════════════════════════════════════════════════════',
      '         QueryMind AI Agent – SQL Analysis Report',
      '═══════════════════════════════════════════════════════════',
      `Generated: ${new Date(result.metadata?.analyzedAt || Date.now()).toLocaleString()}`,
      '',
      `AI AGENT SUMMARY: ${agentSummary}`,
      `CONFIDENCE:       ${result.agent?.confidence || 'N/A'}%`,
      `PERFORMANCE SCORE:${result.score}/100`,
      `RISK LEVEL:       ${result.riskLevel}`,
      `IMPACT:           ${impactText}`,
      '',
      '─── PRIORITY ACTION PLAN ────────────────────────────────',
      ...(actionPlan.length === 0
        ? ['  No action plan generated.']
        : actionPlan.map(item => `  ${item.priority}. ${item.action}\n     Reason: ${item.reason}\n     Benefit: ${item.expectedBenefit}`)),
      '',
      '─── ISSUES FOUND ─────────────────────────────────────────',
      ...(result.issues.length === 0
        ? ['  ✅ No issues detected!']
        : result.issues.map((issue, i) =>
            `  ${i + 1}. [${issue.severity}] ${issue.title}\n     ${issue.description}\n     Fix: ${issue.fix || 'Review manually.'}`
          )),
      '',
      '─── RECOMMENDATIONS ──────────────────────────────────────',
      ...(result.recommendations.length === 0
        ? ['  ✅ No additional recommendations.']
        : result.recommendations.map((r, i) => `  ${i + 1}. ${r}`)),
      '',
      '─── SUGGESTED INDEXES ────────────────────────────────────',
      ...(result.indexes.length === 0
        ? ['  ✅ No additional indexes required.']
        : result.indexes.map(idx => `  • ${idx.statement}\n    Reason: ${idx.reason}`)),
      '',
      '─── EXPLAIN PLAN HINTS ───────────────────────────────────',
      ...(result.explainPlanHint?.length
        ? result.explainPlanHint.map((hint, i) => `  ${i + 1}. ${hint}`)
        : ['  Run EXPLAIN ANALYZE to validate real execution behavior.']),
      '',
      '─── OPTIMIZED QUERY ──────────────────────────────────────',
      result.optimizedQuery || 'No optimized query generated.',
      '',
      '═══════════════════════════════════════════════════════════',
      'Powered by QueryMind AI Agent',
      '═══════════════════════════════════════════════════════════'
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `querymind-agent-report-${Date.now()}.txt`
    a.click()

    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'agent', label: 'AI Agent', icon: Bot },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'issues', label: `Issues (${result.issues.length})`, icon: AlertTriangle },
    { id: 'recommendations', label: 'Fixes', icon: Zap },
    { id: 'optimized', label: 'Optimized', icon: Code2 }
  ]

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-700 block">AI Agent Analysis Complete</span>
                <span className="text-xs text-slate-400">QueryMind SQL Optimization Agent</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadText}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                .txt
              </button>

              <button
                onClick={downloadJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                .json
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ScoreRing score={result.score} />

            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Risk Level
                </p>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${riskCfg.bg} ${riskCfg.border}`}>
                  <RiskIcon className={`w-4 h-4 ${riskCfg.textColor}`} />
                  <span className={`text-sm font-bold ${riskCfg.textColor}`}>
                    {result.riskLevel}
                  </span>
                </div>
              </div>

              <ConfidenceBar confidence={result.agent?.confidence || 0} />

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Agent Summary
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {result.agent?.summary?.summary || 'Query analyzed successfully. Open the AI Agent tab for detailed reasoning.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
            <div className="text-center">
              <div className="text-xl font-extrabold text-slate-800">{result.issues.length}</div>
              <div className="text-xs text-slate-400 font-medium">Issues</div>
            </div>

            <div className="text-center border-x border-slate-100">
              <div className="text-xl font-extrabold text-slate-800">{result.indexes.length}</div>
              <div className="text-xs text-slate-400 font-medium">Indexes</div>
            </div>

            <div className="text-center">
              <div className="text-xl font-extrabold text-slate-800">{result.recommendations.length}</div>
              <div className="text-xs text-slate-400 font-medium">Fixes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`min-w-max flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeSection === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeSection === 'agent' && <AgentCard result={result} />}

      {activeSection === 'overview' && (
        <div className="space-y-3 animate-fade-in">
          {result.metadata && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Query Metadata
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'JOIN Count',
                    value: result.metadata.joinCount ?? '—',
                    good: result.metadata.joinCount < 3
                  },
                  {
                    label: 'Subquery Depth',
                    value: result.metadata.subqueryDepth ?? '—',
                    good: result.metadata.subqueryDepth === 0
                  },
                  {
                    label: 'WHERE Clause',
                    value: result.metadata.hasWhereClause ? 'Present ✓' : 'Missing ✗',
                    good: result.metadata.hasWhereClause
                  },
                  {
                    label: 'LIMIT Clause',
                    value: result.metadata.hasLimit ? 'Present ✓' : 'Missing ✗',
                    good: result.metadata.hasLimit
                  }
                ].map(item => (
                  <div
                    key={item.label}
                    className={`p-3 rounded-xl border ${
                      item.good
                        ? 'bg-emerald-50 border-emerald-100'
                        : 'bg-amber-50 border-amber-100'
                    }`}
                  >
                    <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                    <p className={`text-sm font-bold mt-0.5 ${item.good ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {result.metadata.tablesDetected?.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Tables Detected</p>
                  <p className="text-sm text-slate-700">
                    {result.metadata.tablesDetected.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {result.issues.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Top Issues Summary
              </h4>

              <div className="space-y-2">
                {result.issues.slice(0, 3).map((issue, i) => {
                  const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.Low

                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <span className="text-sm text-slate-600 flex-1">{issue.title}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                        {issue.severity}
                      </span>
                    </div>
                  )
                })}

                {result.issues.length > 3 && (
                  <button
                    onClick={() => setActiveSection('issues')}
                    className="text-xs text-blue-600 font-semibold hover:underline mt-1"
                  >
                    + {result.issues.length - 3} more issues →
                  </button>
                )}
              </div>
            </div>
          )}

          {result.issues.length === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-emerald-800 mb-1">No Issues Detected!</h4>
              <p className="text-sm text-emerald-600">Your query looks well-optimized.</p>
            </div>
          )}
        </div>
      )}

      {activeSection === 'issues' && (
        <div className="space-y-2 animate-fade-in">
          {result.issues.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-emerald-800 mb-1">No Issues Detected!</h4>
              <p className="text-sm text-emerald-600">Your query passes all optimization checks.</p>
            </div>
          ) : (
            result.issues.map((issue, i) => <IssueCard key={i} issue={issue} index={i} />)
          )}
        </div>
      )}

      {activeSection === 'recommendations' && (
        <div className="space-y-3 animate-fade-in">
          {result.recommendations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Optimization Recommendations
              </h4>

              <div className="space-y-2.5">
                {result.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.indexes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-500" />
                Suggested Indexes
              </h4>

              <div className="space-y-2.5">
                {result.indexes.map((idx, i) => (
                  <div
                    key={i}
                    className="p-3 bg-purple-50 border border-purple-100 rounded-xl animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                        {idx.table ? `Table: ${idx.table}` : 'Index Suggestion'}
                      </span>
                      <span className="text-xs text-purple-500">
                        Column: {idx.column}
                      </span>
                    </div>

                    <p className="text-xs text-purple-600 mb-2">{idx.reason}</p>

                    <code className="block text-xs font-mono text-purple-800 bg-purple-100/70 px-3 py-2 rounded-lg overflow-x-auto">
                      {idx.statement}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.recommendations.length === 0 && result.indexes.length === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <Award className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-emerald-800 mb-1">Excellent Query!</h4>
              <p className="text-sm text-emerald-600">No optimization recommendations needed.</p>
            </div>
          )}
        </div>
      )}

      {activeSection === 'optimized' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-700">Optimized Query</span>
            </div>

            <button
              onClick={copyOptimized}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              {copiedQuery ? (
                <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedQuery ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="p-4">
            <pre className="sql-editor text-xs text-emerald-400 bg-slate-900 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {result.optimizedQuery || 'No optimized query generated.'}
            </pre>
          </div>

          {result.optimizedNotes?.length > 0 && (
            <div className="px-4 pb-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-bold text-blue-700 uppercase mb-2">Optimization Notes</p>

                <div className="space-y-1.5">
                  {result.optimizedNotes.map((note, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700 leading-relaxed">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="px-4 pb-4">
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                This is an AI-agent generated suggestion based on static SQL analysis. Review carefully before applying to production. Validate final performance with EXPLAIN or EXPLAIN ANALYZE.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}