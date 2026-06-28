import React, { useState, useEffect } from 'react'
import { getStatsByRange, getAllRecords } from '../db'
import { formatDurationCN } from '../utils/format'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import RecordsIcon from '../components/RecordsIcon'
import DurationIcon from '../components/DurationIcon'
import MailIcon from '../components/MailIcon'
import StreakIcon from '../components/StreakIcon'

const CHART_COLORS = ['#FFB6C1', '#8E7DFE', '#FF8FA3', '#A78BFA', '#22C55E', '#C4B0FF', '#F59E0B', '#F43F5E']
const RANGES = [
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
]

export default function Summary() {
  const [stats, setStats] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [range, setRange] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [range])

  async function loadData() {
    setLoading(true)
    try {
      const [statsData, allRecords] = await Promise.all([getStatsByRange(range), getAllRecords()])
      setStats(statsData)
      setTrendData(computeTrend(allRecords, range))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  function computeTrend(records, r) {
    const grouped = {}
    const now = new Date()

    // 按范围决定分组粒度
    const getKey = r === 'year'
      ? (d) => `${d.getFullYear()}.${d.getMonth() + 1}月`       // 按月
      : (d) => `${d.getMonth() + 1}/${d.getDate()}`               // 按天

    records.forEach(r => {
      const d = new Date(r.date)
      const key = getKey(d)
      if (!grouped[key]) grouped[key] = { label: key, count: 0 }
      grouped[key].count++
    })

    let sorted = Object.values(grouped).sort((a, b) => a.label.localeCompare(b.label))

    // 年视图只取最近12个月
    if (r === 'year') sorted = sorted.slice(-12)

    return sorted
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-dpink-200 border-t-dpink-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats || stats.totalRecords === 0) {
    return (
      <div className="px-4 pt-6 pb-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">成长总结</h1>
        <p className="text-gray-400 text-sm mb-8">查看你的舞蹈进步轨迹</p>
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-50">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-lg mb-2">还没有数据</p>
          <p className="text-gray-400 text-sm">开始记录舞蹈后，这里将展示你的成长分析</p>
        </div>
      </div>
    )
  }

  const danceTypeData = Object.entries(stats.danceTypeDist || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="px-4 pt-6 pb-4 space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">成长总结</h1>
      <p className="text-gray-400 text-sm -mt-4 mb-2">查看你的舞蹈进步轨迹</p>

      {/* 周/月/年切换 */}
      <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-50 inline-flex mx-auto">
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

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard icon={<RecordsIcon size={24} />} label="总记录" value={`${stats.totalRecords}`} color="from-dpink-200 to-dpink-300" />
        <SummaryCard icon={<MailIcon size={24} />} label={`${stats.rangeLabel}练习`} value={`${stats.practiceDays}天`} color="from-dpurple-400 to-dpurple-500" />
        <SummaryCard icon={<DurationIcon size={24} />} label="练习时长" value={formatDurationCN(stats.totalDuration)} color="from-dpink-300 to-dpink-400" />
        <SummaryCard icon={<StreakIcon size={24} />} label="总天数" value={`${stats.totalDays}天`} color="from-dpurple-300 to-dpurple-400" />
      </div>

      {/* 练习趋势 */}
      {trendData.length > 1 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="text-base font-bold text-gray-800 mb-3">练习趋势</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB6C1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FFB6C1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                  labelFormatter={(l) => l} formatter={(v) => [`${v} 条`]} />
                <Area type="monotone" dataKey="count" stroke="#FFB6C1" strokeWidth={2} fill="url(#colorCount)"
                  dot={{ fill: '#FFB6C1', r: 3 }} activeDot={{ r: 5, fill: '#FFB6C1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 舞种分布 - 环形图 */}
      {danceTypeData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="text-base font-bold text-gray-800 mb-3">舞种分布</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={danceTypeData.slice(0, 8)} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {danceTypeData.slice(0, 8).map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(v, n) => [`${v} 次`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* 图例 */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {danceTypeData.slice(0, 8).map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-gray-600">{item.name}</span>
                <span className="font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 小结 */}
      {stats.rangeRecords > 0 && (
        <div className="bg-gradient-to-br from-dpink-50 to-dpurple-50 rounded-2xl p-5 border border-dpink-100">
          <h2 className="text-base font-bold text-gray-800 mb-2">📋 {stats.rangeLabel}小结</h2>
          <div className="space-y-1.5 text-sm text-gray-600">
            <p>{stats.rangeLabel}共练习 <strong className="text-gray-800">{stats.practiceDays}</strong> 天，完成 <strong className="text-gray-800">{stats.rangeRecords}</strong> 条记录</p>
            {stats.totalDuration > 0 && <p>总练习时长约 <strong className="text-gray-800">{formatDurationCN(stats.totalDuration)}</strong></p>}
            {danceTypeData.length > 0 && <p>最常练习的舞种：<strong className="text-gray-800">{danceTypeData[0]?.name}</strong></p>}
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 pb-4">持续练习，见证你的成长 💪</div>
    </div>
  )
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-lg`}>
      <div className={`mb-1 ${typeof icon === 'string' ? 'text-2xl' : ''}`}>{icon}</div>
      <p className="text-white/80 text-xs">{label}</p>
      <p className="text-lg font-bold mt-0.5 leading-tight">{value}</p>
    </div>
  )
}
