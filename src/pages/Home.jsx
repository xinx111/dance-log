import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats } from '../db'
import { formatDate } from '../utils/format'
import GoodIcon from '../components/GoodIcon'

export default function Home() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const statsData = await getStats()
      setStats(statsData)
    } catch (err) {
      console.error('加载数据失败:', err)
    }
    setLoading(false)
  }

  return (
    <div className="px-5 pt-8 pb-4 space-y-6 animate-fade-in">
      {/* 顶部日期/头像 */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{formatDate(new Date(), 'full')}</p>
        <div
          onClick={() => navigate('/profile')}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-dpink-300 to-dpurple-400 flex items-center justify-center text-white text-lg font-bold shadow-md overflow-hidden cursor-pointer active:scale-90 transition-transform flex-shrink-0"
        >
          舞
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-dpink-200 border-t-dpink-400 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* 跳得很好 - 粉色卡片 */}
          <div
            onClick={() => navigate('/record')}
            className="relative bg-dpink-200 rounded-3xl p-6 text-white active:scale-[0.98] transition-transform cursor-pointer overflow-hidden shadow-lg shadow-dpink-200/40"
          >
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/15 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/8 rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/85 text-sm font-medium">舞蹈记录</p>
                  <p className="text-5xl font-bold mt-1">{stats?.totalRecords || 0}</p>
                  <p className="text-white/70 text-xs mt-1">个视频</p>
                </div>
                <GoodIcon size={80} />
              </div>
            </div>
          </div>

          {/* 数据统计行 */}
          {stats && (
            <div className="bg-white rounded-2xl p-4 border border-gray-50/80 shadow-sm">
              <div className="flex items-center justify-around text-center">
                <div>
                  <p className="text-2xl font-bold text-dpink-400">{stats.totalRecords}</p>
                  <p className="text-xs text-gray-400 mt-0.5">总记录</p>
                </div>
                <div className="w-px h-10 bg-gray-100" />
                <div>
                  <p className="text-2xl font-bold text-dpurple-400">{stats.practiceDays}</p>
                  <p className="text-xs text-gray-400 mt-0.5">本月打卡</p>
                </div>
                <div className="w-px h-10 bg-gray-100" />
                <div>
                  <p className="text-2xl font-bold text-dpink-400">{stats.streak}</p>
                  <p className="text-xs text-gray-400 mt-0.5">连续天数</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
