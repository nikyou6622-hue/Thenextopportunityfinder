import React, { useState, useEffect } from 'react';
import apiFetch, { safeJson } from '../lib/apiClient';

export default function SalaryIntelligenceStudio({ profile }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [selectedLocation, setSelectedLocation] = useState('India');
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTierTab, setActiveTierTab] = useState('all');

  const TIER_BENCHMARKS = [
    {
      tier: 'Tier 1 Product / FAANG+',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      companies: ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Atlassian', 'Salesforce', 'Adobe', 'Flipkart', 'Swiggy', 'Zomato', 'Cred', 'Razorpay', 'PhonePe', 'Zerodha'],
      fresherInr: '₹18L - ₹45L',
      fresherUsd: '$110K - $195K',
      seniorInr: '₹45L - ₹1.2Cr+',
      bonus: '15% - 25%',
      equity: 'High (RSUs vesting over 4 years)',
      rating: 'Top 1% Compensation Benchmark'
    },
    {
      tier: 'Tier 2 High-Growth Unicorns',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      companies: ['Paytm', 'Meesho', 'Groww', 'Urban Company', 'InMobi', 'Ola', 'Freshworks', 'Postman', 'Hasura', 'BrowserStack', 'CleverTap', 'Juspay', 'Zepto', 'Blinkit', 'Stripe'],
      fresherInr: '₹12L - ₹28L',
      fresherUsd: '$90K - $150K',
      seniorInr: '₹32L - ₹80L',
      bonus: '10% - 20%',
      equity: 'Substantial ESOPs / RSUs',
      rating: 'High Growth Equity & Base Scale'
    },
    {
      tier: 'Tier 3 Global IT & Consulting MNCs',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      companies: ['Accenture', 'Deloitte', 'PwC', 'EY', 'KPMG', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Capgemini', 'HCLTech', 'Tech Mahindra', 'L&T', 'IBM', 'Oracle', 'SAP'],
      fresherInr: '₹4.5L - ₹14L',
      fresherUsd: '$65K - $110K',
      seniorInr: '₹16L - ₹42L',
      bonus: '8% - 15%',
      equity: 'Limited / ESPP',
      rating: 'Enterprise Scale & Global Mobility'
    }
  ];

  const ROLE_MULTIPLIERS = [
    { role: 'AI / Machine Learning Engineer', multiplier: '1.30x', tag: '+30% Premium' },
    { role: 'Data Engineer / Scientist', multiplier: '1.20x', tag: '+20% Premium' },
    { role: 'Site Reliability / DevOps', multiplier: '1.20x', tag: '+20% Premium' },
    { role: 'Backend Software Engineer', multiplier: '1.05x', tag: '+5% Baseline' },
    { role: 'Full Stack Engineer', multiplier: '1.05x', tag: '+5% Baseline' },
    { role: 'Frontend Software Engineer', multiplier: '1.00x', tag: 'Standard Base' },
    { role: 'QA Automation Engineer', multiplier: '0.85x', tag: 'QA Standard' }
  ];

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const resp = await apiFetch(`/api/salary-benchmark?company=${encodeURIComponent(searchTerm)}&role=${encodeURIComponent(selectedRole)}&location=${encodeURIComponent(selectedLocation)}`);
      const data = await safeJson(resp);
      setBenchmarkResult(data);
    } catch (err) {
      console.error('Salary benchmark lookup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-Time Compensation Intelligence Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Indian & Global Tech CTC Salary Benchmark Studio
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Data-driven CTC benchmarks, tech ecosystem tier breakdowns (FAANG+, Tier-1 Product, Tier-2 Unicorns, Tier-3 IT MNCs), and role-specific compensation multipliers.
          </p>
        </div>
      </div>

      {/* Interactive Search & Lookup */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🔍</span> Lookup Target Company Salary Benchmark
        </h2>
        <form onSubmit={handleLookup} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Enter company name (e.g. Google, Swiggy, TCS)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="Software Engineer">Software Engineer</option>
            <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
            <option value="Backend Software Engineer">Backend Engineer</option>
            <option value="Frontend Engineer">Frontend Engineer</option>
            <option value="Full Stack Engineer">Full Stack Engineer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
          </select>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="India">Bengaluru / India</option>
            <option value="Remote">Remote (Global)</option>
            <option value="US">US / North America</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Fetch Benchmark'}
          </button>
        </form>

        {/* Benchmark Output Card */}
        {benchmarkResult && (
          <div className="mt-6 p-6 rounded-xl bg-slate-800/90 border border-emerald-500/30 space-y-4 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white capitalize">{benchmarkResult.normalized_company || searchTerm}</h3>
                <p className="text-xs text-slate-400">{benchmarkResult.role} • {benchmarkResult.location}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {benchmarkResult.rating || 'Standard Tech Tier'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">Fresher CTC Range (INR)</span>
                <span className="text-lg font-bold text-emerald-400">{benchmarkResult.fresher_ctc_inr || '₹8L - ₹24L'}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">Senior CTC Range (INR)</span>
                <span className="text-lg font-bold text-amber-400">{benchmarkResult.senior_ctc_inr || '₹28L - ₹65L'}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">Role Multiplier Applied</span>
                <span className="text-lg font-bold text-blue-400">{benchmarkResult.role_multiplier || '1.05x'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tech Ecosystem Tiers Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🏆</span> India & Global Tech Company Tier Standards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIER_BENCHMARKS.map((t, idx) => (
            <div key={idx} className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all duration-200">
              <div className="space-y-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${t.badgeColor}`}>
                  {t.tier}
                </span>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Fresher Base CTC (INR):</span>
                    <span className="font-bold text-white">{t.fresherInr}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Senior Base CTC (INR):</span>
                    <span className="font-bold text-white">{t.seniorInr}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Target Bonus:</span>
                    <span className="font-bold text-emerald-400">{t.bonus}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-xs font-medium text-slate-400 block mb-1">Featured Companies:</span>
                  <div className="flex flex-wrap gap-1">
                    {t.companies.slice(0, 8).map((co, cIdx) => (
                      <span key={cIdx} className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">
                        {co}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded border border-slate-800/60">
                {t.rating}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Multipliers Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📊</span> Role Compensation Multipliers (Relative to Baseline SDE)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {ROLE_MULTIPLIERS.map((rm, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">{rm.role}</h4>
                <span className="text-[11px] text-emerald-400 font-medium">{rm.tag}</span>
              </div>
              <span className="text-lg font-black text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                {rm.multiplier}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
