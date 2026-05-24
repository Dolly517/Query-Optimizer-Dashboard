import React from 'react'
import { Database, Github, Twitter, Heart, Zap, Shield, Code2 } from 'lucide-react'

const links = {
  Product: [
    { label: 'SQL Analyzer', href: '#analyzer' },
    { label: 'Features', href: '#features' },
    { label: 'Performance Score', href: '#analyzer' },
    { label: 'Index Advisor', href: '#analyzer' },
  ],
  Resources: [
    { label: 'SQL Optimization Guide', href: '#' },
    { label: 'Index Best Practices', href: '#' },
    { label: 'Query Patterns', href: '#' },
    { label: 'Documentation', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#developer' },
    { label: 'Developer', href: '#developer' },
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'Contact', href: 'mailto:hi@querymind.ai' },
  ],
}

export default function Footer() {
  return (
    <footer id="about" className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-white text-lg">QueryMind</span>
                <span className="text-blue-400 font-bold text-lg">AI</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              AI-powered SQL query optimizer built for developers and DBAs who care about database performance.
              Zero cost, zero API keys, instant results.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                <Github className="w-4 h-4 text-slate-400" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Feature badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: Zap, text: 'Zero Cost' },
                { icon: Shield, text: 'Rule-Based AI' },
                { icon: Code2, text: 'Open Source' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-lg text-xs font-medium text-slate-400">
                  <Icon className="w-3 h-3 text-blue-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">{section}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            © 2026 QueryMind AI. Developed by Dolly Rajoriya. Built with
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            for the developer community.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <span>·</span>
            <a href="#" className="hover:text-slate-300 transition-colors">MIT License</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
