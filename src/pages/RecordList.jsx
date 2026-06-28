import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getRecordsByCategory } from '../db'
import { formatDate, formatDuration } from '../utils/format'
import GoodIcon from '../components/GoodIcon'

export default function RecordList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const categoryFilter = searchParams.get('category')
  const [goodRecords, setGoodRecords] = useState([])
  const [needsWorkRecords, setNeedsWorkRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const title = categoryFilter === 'good'
    ? '跳得很好'
    : categoryFilter === 'needs-work'
      ? '还需要努力'
      : '所有记录'

  useEffect(() => {
    loadRecords()
  }, [categoryFilter])

  async function loadRecords() {
    setLoading(true)
    try {
      if (categoryFilter) {
        const records = await getRecordsByCategory(categoryFilter)
        if (categoryFilter === 'good') {
          setGoodRecords(records)
          setNeedsWorkRecords([])
        } else {
          setGoodRecords([])
          setNeedsWorkRecords(records)
        }
      } else {
        const [good, needsWork] = await Promise.all([
          getRecordsByCategory('good'),
          getRecordsByCategory('needs-work'),
        ])
        setGoodRecords(good)
        setNeedsWorkRecords(needsWork)
      }
    } catch (err) {
      console.error('加载记录失败:', err)
    }
    setLoading(false)
  }

  const hasGood = goodRecords.length > 0
  const hasNeedsWork = needsWorkRecords.length > 0
  const isEmpty = !hasGood && !hasNeedsWork

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 -ml-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-gray-600">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
        <button
          onClick={() => navigate('/record/new')}
          className="bg-dpink-400 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center gap-1.5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          记录舞蹈
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-dpink-200 border-t-dpink-400 rounded-full animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🎀</div>
          <p className="text-gray-500 text-lg mb-1">还没有舞蹈记录</p>
          <p className="text-gray-400 text-sm mb-6">开始记录你的第一支舞吧！</p>
          <button
            onClick={() => navigate('/record/new')}
            className="bg-dpink-400 text-white font-medium px-6 py-3 rounded-xl active:scale-95 transition-transform"
          >
            开始记录
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {hasGood && (
            <Section
              title="跳得很好"
              count={goodRecords.length}
              color="pink"
              records={goodRecords}
              onClickRecord={(id) => navigate(`/record/${id}`)}
            />
          )}
          {hasNeedsWork && (
            <Section
              title="还需要努力"
              count={needsWorkRecords.length}
              color="purple"
              records={needsWorkRecords}
              onClickRecord={(id) => navigate(`/record/${id}`)}
            />
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, count, color, records, onClickRecord }) {
  const isPink = color === 'pink'

  return (
    <div>
      {/* 分区标题 */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-2 ${
        isPink ? 'bg-dpink-50' : 'bg-dpurple-50'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isPink ? 'bg-dpink-200' : 'bg-dpurple-400'}`} />
        <h2 className={`font-bold text-sm ${isPink ? 'text-dpink-400' : 'text-dpurple-400'}`}>
          {title}
        </h2>
        <span className={`text-xs ${isPink ? 'text-dpink-400' : 'text-dpurple-400'} opacity-60`}>
          {count} 个视频
        </span>
      </div>

      {/* 记录列表 */}
      <div className="space-y-2">
        {records.map((record) => (
          <div
            key={record.id}
            onClick={() => onClickRecord(record.id)}
            className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform cursor-pointer border border-gray-50"
          >
            <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-xl ${
              isPink ? 'bg-dpink-100' : 'bg-dpurple-100'
            }`}>
              {isPink ? <GoodIcon size={24} /> : '🔥'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {record.songName || '未命名曲目'}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5">
                <span>{formatDate(record.date)}</span>
                {record.duration > 0 && <span>{formatDuration(record.duration)}</span>}
                {record.danceType && (
                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {record.danceType}
                  </span>
                )}
              </div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-300">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}
