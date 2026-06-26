import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecordsByMonth, getStreak } from '../db'
import { getMonthDays, formatDate, formatMonth, formatDuration } from '../utils/format'

export default function CalendarPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [practiceDates, setPracticeDates] = useState(new Set())
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayRecords, setDayRecords] = useState([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [monthStats, setMonthStats] = useState({ count: 0, days: 0 })

  useEffect(() => { loadMonthData() }, [year, month])

  async function loadMonthData() {
    setLoading(true)
    try {
      const records = await getRecordsByMonth(year, month)
      const dates = new Set(records.map(r => new Date(r.date).toDateString()))
      setPracticeDates(dates)
      setMonthStats({ count: records.length, days: dates.size })
      const s = await getStreak()
      setStreak(s)
      if (selectedDate) {
        const dr = records.filter(r => new Date(r.date).toDateString() === new Date(selectedDate).toDateString())
        setDayRecords(dr)
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function handleDateClick(day) {
    if (!day) return
    const date = new Date(year, month - 1, day)
    setSelectedDate(date)
    try {
      const records = await getRecordsByMonth(year, month)
      setDayRecords(records.filter(r => new Date(r.date).toDateString() === date.toDateString()))
    } catch (err) { console.error(err) }
  }

  const days = getMonthDays(year, month)
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const today = new Date()

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">练习日历</h1>
      <p className="text-gray-400 text-sm mb-4">查看你的舞蹈足迹</p>

      {/* 连续打卡 - 粉色 */}
      <div className="bg-dpink-200 rounded-2xl p-5 text-white shadow-lg shadow-dpink-200/40 flex items-center justify-between mb-4">
        <div>
          <p className="text-white/80 text-sm">连续打卡</p>
          <p className="text-3xl font-bold mt-1">{streak} 天</p>
        </div>
        <div className="text-right">
          <p className="text-white/80 text-sm">本月练习</p>
          <p className="text-xl font-bold mt-1">{monthStats.days} 天</p>
          <p className="text-white/70 text-xs">{monthStats.count} 条记录</p>
        </div>
      </div>

      {/* 日历 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1); setSelectedDate(null); setDayRecords([]) }}
            className="p-2 hover:bg-gray-50 rounded-xl">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-gray-500">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-gray-800">{formatMonth(year, month)}</h2>
          <button onClick={() => { if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1); setSelectedDate(null); setDayRecords([]) }}
            className="p-2 hover:bg-gray-50 rounded-xl">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-gray-500">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) return <div key={`e-${index}`} className="aspect-square" />
            const date = new Date(year, month - 1, day)
            const dateStr = date.toDateString()
            const isToday = dateStr === today.toDateString()
            const hasPractice = practiceDates.has(dateStr)
            const isSelected = selectedDate?.toDateString() === dateStr

            return (
              <button key={day} onClick={() => handleDateClick(day)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                  isSelected ? 'bg-dpink-400 text-white shadow-md' :
                  hasPractice ? 'bg-dpurple-100 text-dpurple-400' :
                  isToday ? 'bg-dpink-50 text-dpink-400' :
                  'hover:bg-gray-50 text-gray-700'
                }`}>
                <span className="text-sm font-medium">{day}</span>
                {hasPractice && !isSelected && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isToday ? 'bg-dpink-400' : 'bg-dpurple-400'
                  }`} />
                )}
                {isToday && !hasPractice && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full mt-0.5 bg-dpink-400" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 选中日期的记录 */}
      {selectedDate && (
        <div className="mt-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">{formatDate(selectedDate)}</h3>
            <span className="text-sm text-gray-400">{dayRecords.length} 条记录</span>
          </div>
          {dayRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-50">
              <p className="text-gray-400">当天没有舞蹈记录</p>
              <button onClick={() => navigate('/record/new')}
                className="text-dpink-400 text-sm font-medium mt-2">
                添加记录 →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {dayRecords.map(record => (
                <div key={record.id} onClick={() => navigate(`/record/${record.id}`)}
                  className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform cursor-pointer border border-gray-50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    record.category === 'good' ? 'bg-dpink-100' : 'bg-dpurple-100'
                  }`}>
                    {record.category === 'good' ? '🌟' : '🔥'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{record.songName || '未命名'}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      {record.danceType && <span>{record.danceType}</span>}
                      {record.duration > 0 && <span>· {formatDuration(record.duration)}</span>}
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-300">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 图例 - 粉紫色 */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-dpurple-100" />已练习
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-dpink-400" />选中
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-dpink-50" />今天
        </div>
      </div>
    </div>
  )
}
