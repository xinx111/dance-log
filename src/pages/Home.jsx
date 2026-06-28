import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStatsByRange, getAllRecords } from '../db'
import { formatDate } from '../utils/format'
import RecordsIcon from '../components/RecordsIcon'
import MailIcon from '../components/MailIcon'
import StreakIcon from '../components/StreakIcon'
import DefaultAvatar from '../components/DefaultAvatar'
import GoodIcon from '../components/GoodIcon'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'

const CHART_COLORS = ['#FFB6C1', '#FF8FA3', '#A78BFA', '#22C55E', '#C4B0FF', '#F59E0B', '#F43F5E']
const RANGES = [
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
]

export default function Home() {
  const navigate = useNavigate()
  const [range, setRange] = useState('month')
  const [stats, setStats] = useState(null)
  const [aiScoreData, setAiScoreData] = useState([])
  const [danceTypeData, setDanceTypeData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [range])

  async function loadData() {
    setLoading(true)
    try {
      const [statsData, allRecords] = await Promise.all([
        getStatsByRange(range),
        getAllRecords(),
      ])
      setStats(statsData)
      setAiScoreData(computeAiScores(allRecords))
      setDanceTypeData(computeDanceTypes(allRecords, range))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  function computeAiScores(records) {
    const scored = records
      .filter(r => r.analysisResults?.single?.totalScore)
      .map(r => ({
        date: new Date(r.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        score: r.analysisResults.single.totalScore,
        rawDate: new Date(r.date),
      }))
      .sort((a, b) => a.rawDate - b.rawDate)

    if (scored.length < 2) return []
    return scored
  }

  function computeDanceTypes(records, r) {
    const now = new Date()
    let start
    if (r === 'week') {
      const dayOfWeek = now.getDay()
      start = new Date(now)
      start.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    } else if (r === 'year') {
      start = new Date(now.getFullYear(), 0, 1)
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const dist = {}
    records.forEach(r => {
      if (new Date(r.date) >= start && r.danceType) {
        dist[r.danceType] = (dist[r.danceType] || 0) + 1
      }
    })
    return Object.entries(dist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  if (loading) {
    return (
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-dpink-200 border-t-dpink-400 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-4 space-y-5 animate-fade-in">
      {/* 顶部日期/头像 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{formatDate(new Date(), 'full')}</p>
          <h1 className="text-2xl font-bold text-gray-800 mt-0.5">舞迹</h1>
        </div>
        <div
          onClick={() => navigate('/profile')}
          className="w-12 h-12 rounded-full overflow-hidden shadow-md cursor-pointer active:scale-90 transition-transform flex-shrink-0"
        >
          <DefaultAvatar className="w-full h-full" />
        </div>
      </div>

      {/* 周/月/年切换 */}
      <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-50 inline-flex">
        {RANGES.map(r => (
          <button key={r.key} onClick={() => setRange(r.key)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              range === r.key
                ? 'bg-dpink-400 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {r.label}
          </button>
        ))}
      </div>

      {/* 粉色记录卡片 */}
      {stats && (
        <div
          onClick={() => navigate('/record')}
          className="relative bg-dpink-200 rounded-3xl p-6 text-white active:scale-[0.98] transition-transform cursor-pointer overflow-hidden shadow-lg shadow-dpink-200/40"
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/15 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/8 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/85 text-sm font-medium">{stats.rangeLabel}记录</p>
                <p className="text-5xl font-bold mt-1">{stats.rangeRecords}</p>
                <p className="text-white/70 text-xs mt-1">条舞蹈记录</p>
              </div>
              <GoodIcon size={80} />
            </div>
          </div>
        </div>
      )}

      {/* 概览卡片 */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <StatsCard icon={<RecordsIcon size={20} />} label="舞蹈个数" value={`${stats.totalRecords}`} color="from-dpink-200 to-dpink-300" />
          <StatsCard icon={<MailIcon size={20} />} label={`${stats.rangeLabel}练习`} value={`${stats.practiceDays}天`} color="from-dpurple-400 to-dpurple-500" />
          <StatsCard icon={<StreakIcon size={20} />} label="总天数" value={`${stats.totalDays}天`} color="from-dpurple-300 to-dpurple-400" />
        </div>
      )}

      {/* 舞种分布 */}
      {danceTypeData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="text-base font-bold text-gray-800 mb-3">舞种分布</h2>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={danceTypeData.slice(0, 7)} cx="50%" cy="50%" innerRadius={45} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {danceTypeData.slice(0, 7).map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(v, n) => [`${v} 次`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {danceTypeData.slice(0, 7).map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-gray-600">{item.name}</span>
                <span className="font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI 评分趋势 */}
      {aiScoreData.length > 1 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-dpink-400">
              <path d="M12 2l2.4 7.2L22 9l-6 4.8L17.6 22 12 17l-5.6 5L8 13.8 2 9l7.6-.2z" />
            </svg>
            AI 评分趋势
          </h2>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                  formatter={(v) => [`${v} 分`]} />
                <Line type="monotone" dataKey="score" stroke="#8E7DFE" strokeWidth={2.5}
                  dot={{ fill: '#8E7DFE', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#8E7DFE' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 小结 */}
      {stats && stats.rangeRecords > 0 && (
        <div className="bg-gradient-to-br from-dpink-50 to-dpurple-50 rounded-2xl p-5 border border-dpink-100">
          <h2 className="text-base font-bold text-gray-800 mb-2">📋 {stats.rangeLabel}小结</h2>
          <div className="space-y-1.5 text-sm text-gray-600">
            <p>{stats.rangeLabel}共练习 <strong className="text-gray-800">{stats.practiceDays}</strong> 天，完成 <strong className="text-gray-800">{stats.rangeRecords}</strong> 条记录</p>
            {danceTypeData.length > 0 && <p>最常练习的舞种：<strong className="text-gray-800">{danceTypeData[0]?.name}</strong></p>}
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 pb-4">持续练习，见证你的成长 💪</div>
    </div>
  )
}

function StatsCard({ icon, label, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-3 text-white shadow-lg text-center`}>
      <div className="flex justify-center mb-0.5">{icon}</div>
      <p className="text-white/80 text-[10px]">{label}</p>
      <p className="text-base font-bold mt-0.5 leading-tight">{value}</p>
    </div>
  )
}
