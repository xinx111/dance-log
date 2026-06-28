import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecordsByMonth, getTotalPracticeDays } from '../db'
import { getMonthDays, formatDate, formatMonth, formatDuration } from '../utils/format'
import { getVideoUri } from '../utils/storage'
import GoodIcon from '../components/GoodIcon'

const iconMap = { good: <GoodIcon size={20} /> }

export default function CalendarPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayRecords, setDayRecords] = useState([])
  const [totalDays, setTotalDays] = useState(0)
  const [loading, setLoading] = useState(true)
  const [monthStats, setMonthStats] = useState({ count: 0, days: 0 })
  const [playingVideoId, setPlayingVideoId] = useState(null)
  const [videoSrcs, setVideoSrcs] = useState({})

  useEffect(() => { loadMonthData() }, [year, month])

  async function loadMonthData() {
    setLoading(true)
    try {
      const records = await getRecordsByMonth(year, month)
      setMonthStats({ count: records.length, days: [...new Set(records.map(r => new Date(r.date).toDateString()))].length })
      const days = await getTotalPracticeDays()
      setTotalDays(days)
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
    setPlayingVideoId(null)
    try {
      const records = await getRecordsByMonth(year, month)
      setDayRecords(records.filter(r => new Date(r.date).toDateString() === date.toDateString()))
    } catch (err) { console.error(err) }
  }

  async function handlePlayVideo(record) {
    if (playingVideoId === record.id) {
      setPlayingVideoId(null)
      return
    }
    setPlayingVideoId(record.id)
    if (!videoSrcs[record.id] && record.videoUrl) {
      const uri = await getVideoUri(record.videoUrl)
      setVideoSrcs(prev => ({ ...prev, [record.id]: uri }))
    }
  }

  const days = getMonthDays(year, month)
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const today = new Date()

  function getDayClass(day) {
    if (!day) return ''
    const date = new Date(year, month - 1, day)
    const dateStr = date.toDateString()
    const isToday = dateStr === today.toDateString()
    const isSelected = selectedDate?.toDateString() === dateStr
    if (isSelected) return 'bg-dpink-400 text-white shadow-md'
    if (isToday) return 'bg-dpink-50 text-dpink-400 font-semibold'
    return 'hover:bg-gray-50 text-gray-700'
  }

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">练习日历</h1>
      <p className="text-gray-400 text-sm mb-4">查看你的舞蹈足迹</p>

      {/* 总练习天数 */}
      <div className="bg-dpink-200 rounded-2xl p-5 text-white shadow-lg shadow-dpink-200/40 flex items-center justify-between mb-4">
        <div>
          <p className="text-white/80 text-sm">总天数</p>
          <p className="text-3xl font-bold mt-1">{totalDays} 天</p>
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
            return (
              <button key={day} onClick={() => handleDateClick(day)}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all ${getDayClass(day)}`}>
                <span className="text-sm font-medium">{day}</span>
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
            <div className="space-y-3">
              {dayRecords.map(record => (
                <div key={record.id}>
                  <div
                    onClick={() => handlePlayVideo(record)}
                    className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-hidden active:scale-[0.99] transition-transform cursor-pointer"
                  >
                    <div className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        record.category === 'good' ? 'bg-dpink-100' : 'bg-dpurple-100'
                      }`}>
                        {iconMap[record.category] || <GoodIcon size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{record.songName || '未命名'}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          {record.danceType && <span>{record.danceType}</span>}
                          {record.duration > 0 && <span>· {formatDuration(record.duration)}</span>}
                        </div>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                        className={`w-5 h-5 transition-transform ${playingVideoId === record.id ? 'rotate-180 text-dpink-400' : 'text-gray-300'}`}>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>

                    {playingVideoId === record.id && (
                      <div className="border-t border-gray-50 animate-slide-up">
                        {videoSrcs[record.id] ? (
                          <video src={videoSrcs[record.id]} controls
                            className="w-full max-h-64 object-contain bg-black" controls />
                        ) : record.videoUrl ? (
                          <div className="flex items-center justify-center h-32 bg-gray-50 text-gray-400 text-sm">
                            加载中...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-20 bg-gray-50 text-gray-400 text-sm">
                            暂无视频
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
