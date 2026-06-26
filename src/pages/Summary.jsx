import React, { useState, useEffect } from 'react'
import { getStats, getAllRecords } from '../db'
import { formatDurationCN } from '../utils/format'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'

const CHART_COLORS = ['#FFB6C1', '#8E7DFE', '#22C55E', '#A78BFA', '#FF8FA3', '#C4B0FF']

export default function Summary() {
  const [stats, setStats] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [statsData, allRecords] = await Promise.all([getStats(), getAllRecords()])
      setStats(statsData)
      setTrendData(computeTrend(allRecords))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  function computeTrend(records) {
    const grouped = {}
    records.forEach(r => {
      const d = new Date(r.date)
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      if (!grouped[key]) grouped[key] = { date: key, count: 0, good: 0, needsWork: 0 }
      grouped[key].count++
      if (r.category === 'good') grouped[key].good++
      else grouped[key].needsWork++
    })
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).slice(-30).map(([k, v]) => ({ ...v, label: k.slice(5) }))
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

  const categoryData = [
    { name: '跳得很好', value: stats.goodCount, color: '#FFB6C1' },
    { name: '还需要努力', value: stats.needsWorkCount, color: '#8E7DFE' },
  ].filter(d => d.value > 0)

  const danceTypeData = Object.entries(stats.danceTypeDist || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="px-4 pt-6 pb-4 space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">成长总结</h1>
      <p className="text-gray-400 text-sm -mt-4 mb-2">查看你的舞蹈进步轨迹</p>

      {/* 概览卡片 - 粉紫色系 */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard icon="📝" label="总记录" value={`${stats.totalRecords}`} color="from-dpink-200 to-dpink-300" />
        <SummaryCard icon="📅" label="本月练习" value={`${stats.practiceDays}天`} color="from-dpurple-400 to-dpurple-500" />
        <SummaryCard icon="⏱️" label="练习时长" value={formatDurationCN(stats.totalDuration)} color="from-dpink-300 to-dpink-400" />
        <SummaryCard icon="🔥" label="连续打卡" value={`${stats.streak}天`} color="from-dpurple-300 to-dpurple-400" />
      </div>

      {/* 分类饼图 */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="text-base font-bold text-gray-800 mb-3">练习分类</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(v, n) => [`${v} 条`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {categoryData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-gray-600">{d.name}</span>
                <span className="font-bold text-gray-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* 舞种分布 */}
      {danceTypeData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h2 className="text-base font-bold text-gray-800 mb-3">舞种分布</h2>
          <div className="space-y-3">
            {danceTypeData.slice(0, 8).map((item, index) => {
              const maxValue = Math.max(...danceTypeData.map(d => d.value))
              const pct = Math.round((item.value / maxValue) * 100)
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-medium text-gray-800">{item.value} 次</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 本月小结 */}
      {stats.monthRecords > 0 && (
        <div className="bg-gradient-to-br from-dpink-50 to-dpurple-50 rounded-2xl p-5 border border-dpink-100">
          <h2 className="text-base font-bold text-gray-800 mb-2">📋 本月小结</h2>
          <div className="space-y-1.5 text-sm text-gray-600">
            <p>本月共练习 <strong className="text-gray-800">{stats.practiceDays}</strong> 天，完成 <strong className="text-gray-800">{stats.monthRecords}</strong> 条记录</p>
            <p>其中 <span className="text-dpink-400 font-medium">跳得很好</span> {stats.goodCount} 条，<span className="text-dpurple-400 font-medium">还需要努力</span> {stats.needsWorkCount} 条</p>
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
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-white/80 text-xs">{label}</p>
      <p className="text-lg font-bold mt-0.5 leading-tight">{value}</p>
    </div>
  )
}
