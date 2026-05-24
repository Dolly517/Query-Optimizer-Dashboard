import React from 'react'
import { Github, Linkedin, Mail, Code, Zap, Award } from 'lucide-react'

const frontendSkills = ['React', 'JavaScript', 'Tailwind CSS', 'Vite', 'React Router']
const backendSkills = ['Node.js', 'Express.js', 'Multer', 'REST APIs', 'Rule-based logic']
const projectHighlights = [
  'SQL query paste and syntax-highlighted editor',
  'Database schema input for deep index analysis',
  '.sql file upload with drag-and-drop',
  '10+ SQL issue detectors',
  'Performance score out of 100',
  'Index recommendations with CREATE INDEX statements',
  'Optimized query generation',
  'Downloadable reports (.txt and .json)',
]

export default function Developer() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl blur-2xl opacity-40" />
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center shadow-2xl border-4 border-slate-900">
                <span className="text-4xl md:text-5xl font-extrabold text-white">D</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Dolly Rajoriya</h1>
          <p className="text-xl text-blue-300 mb-6 font-medium">Data Analyst | ML Enthusiast | Full-Stack Developer</p>
          <p className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-4">
            Branch: Computer Science and Business Systems
          </p>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed mb-8">
            B.Tech (Computer Science and Business Systems) student with hands-on experience in data analysis, machine learning,
            and full-stack web development. Built production-ready applications, analytics dashboards, and rule-based tooling
            for developers and analysts.
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <a
              href="https://github.com/Dolly517"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/80 text-slate-200 hover:bg-slate-800 transition-all border border-slate-700/80 font-medium whitespace-nowrap text-sm backdrop-blur-sm"
            >
              <Github size={18} className="flex-shrink-0" />
              GitHub
            </a>

            <a
              href="https://linkedin.com/in/dolly-rajoriya-68235633a"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all border border-blue-500/50 hover:border-blue-400 font-medium whitespace-nowrap text-sm backdrop-blur-sm"
            >
              <Linkedin size={18} className="flex-shrink-0" />
              LinkedIn
            </a>

            <a
              href="mailto:dollyrajoriya517@gmail.com"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all border border-emerald-500/50 hover:border-emerald-400 font-medium whitespace-nowrap text-sm backdrop-blur-sm"
            >
              <Mail size={18} className="flex-shrink-0" />
              Email
            </a>
          </div>
        </div>

        {/* Skills Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Code size={20} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Frontend</h3>
            </div>
            <ul className="space-y-3">
              {frontendSkills.map(skill => (
                <li key={skill} className="flex items-start gap-3">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-slate-300">{skill}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Zap size={20} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Backend & Tools</h3>
            </div>
            <ul className="space-y-3">
              {backendSkills.map(skill => (
                <li key={skill} className="flex items-start gap-3">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-slate-300">{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-16">
          <a
            href="https://github.com/Dolly517"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:scale-105"
          >
            View GitHub Profile
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
