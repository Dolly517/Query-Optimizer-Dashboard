import React from 'react'
import {
  Github, Twitter, Linkedin, Globe, Code2, Database,
  Zap, Shield, Mail, ExternalLink, Star, Heart
} from 'lucide-react'

const techStack = [
  { name: 'React 18', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
  { name: 'Vite', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  { name: 'Tailwind CSS', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
  { name: 'Node.js', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { name: 'Express.js', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' },
  { name: 'Rule-Based AI', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { name: 'Lucide React', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { name: 'Multer', color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200' },
]

const highlights = [
  { icon: Code2, label: '2,000+ lines of code', color: 'text-blue-500 bg-blue-50' },
  { icon: Shield, label: '10+ SQL detectors', color: 'text-emerald-500 bg-emerald-50' },
  { icon: Zap, label: 'Zero API cost', color: 'text-amber-500 bg-amber-50' },
  { icon: Database, label: 'Schema-aware analysis', color: 'text-purple-500 bg-purple-50' },
]

export default function DeveloperSection() {
  return (
    <section id="developer" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full mb-4">
            <Heart className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">About</span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            Built with <span className="gradient-text">Passion</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            QueryMind AI is an open-source project built to help developers and DBAs write better SQL
            queries without the need for expensive profiling tools or cloud services.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Developer card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header banner */}
            <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="absolute text-white text-xs font-mono opacity-50"
                    style={{ top: `${Math.random() * 80}%`, left: `${i * 14}%` }}>
                    {['SELECT', 'INDEX', 'JOIN', 'WHERE', 'LIMIT', 'GROUP BY', 'ORDER BY', 'CREATE'][i]}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="relative -mt-10 mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-white text-3xl font-extrabold">Q</span>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-xl font-extrabold text-slate-900">QueryMind AI</h3>
                <p className="text-blue-600 font-semibold text-sm mt-0.5">Open Source SQL Optimization Tool</p>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  A powerful, free-to-use SQL query analyzer built for developers, DBAs, and engineers who care
                  about database performance. No API keys, no subscriptions — just pure, rule-based intelligence.
                </p>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {highlights.map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{label}</span>
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div className="flex items-center gap-2">
                {[
                  { icon: Github, label: 'Dolly517', href: 'https://github.com/Dolly517', color: 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50' },
                    { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/dolly-rajoriya-68235633a', color: 'text-sky-700 border-sky-200 bg-sky-50 hover:bg-sky-100' },
                    { icon: Mail, label: 'dollyrajoriya517@gmail.com', href: 'mailto:dollyrajoriya517@gmail.com', color: 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50' },
                ].map(({ icon: Icon, label, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right side: Tech stack + Project info */}
          <div className="space-y-6">
            {/* Tech Stack */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-500" />
                Technology Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {techStack.map(tech => (
                  <span
                    key={tech.name}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border ${tech.bg} ${tech.color}`}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                How the AI Engine Works
              </h4>
              <div className="space-y-3">
                {[
                  { step: '01', title: 'SQL Parsing', desc: 'Tokenizes and pattern-matches your SQL using regex-based structural analysis.' },
                  { step: '02', title: 'Schema Indexing', desc: 'Parses CREATE TABLE statements to build a catalog of existing indexed columns.' },
                  { step: '03', title: 'Rule Evaluation', desc: 'Runs 10+ detection rules, each with a configurable severity weight and score penalty.' },
                  { step: '04', title: 'Report Generation', desc: 'Computes final score, risk level, recommendations, index suggestions, and optimized query.' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white text-xs font-extrabold rounded-lg flex items-center justify-center flex-shrink-0">
                      {step}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open source banner */}
            <div className="p-5 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl text-white">
              <div className="flex items-center gap-3 mb-3">
                <Github className="w-6 h-6 text-white" />
                <div>
                  <p className="font-bold text-sm">Open Source</p>
                  <p className="text-slate-400 text-xs">MIT License — free to use and modify</p>
                </div>
              </div>
              <p className="text-slate-300 text-xs mb-3 leading-relaxed">
                QueryMind AI is fully open source. Star it, fork it, contribute your own detection rules, or deploy it on your own infrastructure.
              </p>
              <a
                href="https://github.com/Dolly517"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                Star on GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
