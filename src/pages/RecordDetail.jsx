import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecord, deleteRecord } from '../db'
import { formatDate, formatDuration } from '../utils/format'
import { getVideoUri, deleteVideoFile } from '../utils/storage'
import GoodIcon from '../components/GoodIcon'

export default function RecordDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [videoSrc, setVideoSrc] = useState('')
  const [loading, setLoading] = useState(true)
  const [videoLoading, setVideoLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => { loadRecord() }, [id])

  async function loadRecord() {
    try {
      const data = await getRecord(Number(id))
      setRecord(data)

      // 解析视频 URI
      if (data?.videoUrl) {
        const uri = await getVideoUri(data.videoUrl)
        setVideoSrc(uri)
      }
    } catch (err) { console.error('加载记录失败:', err) }
    setLoading(false)
    setVideoLoading(false)
  }

  async function handleDelete() {
    try {
      if (record?.videoUrl) {
        await deleteVideoFile(record.videoUrl)
      }
      await deleteRecord(Number(id))
      navigate('/', { replace: true })
    } catch (err) { console.error('删除失败:', err) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-dpink-200 border-t-dpink-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-5xl mb-4">😢</div>
        <p className="text-gray-500">记录不存在</p>
        <button onClick={() => navigate('/')} className="bg-dpink-400 text-white px-6 py-3 rounded-xl mt-4">
          返回首页
        </button>
      </div>
    )
  }

  const isGood = record.category === 'good'

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-gray-600">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/record/${id}/edit`)}
            className="text-gray-400 hover:text-dpink-400 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="text-gray-400 hover:text-red-500 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* 视频 */}
      {record.videoUrl && (
        <div className="rounded-2xl overflow-hidden bg-black mb-4 shadow-lg relative">
          {videoLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : videoSrc ? (
            <video src={videoSrc} controls className="w-full max-h-80 object-contain" />
          ) : (
            <div className="flex items-center justify-center h-48 text-white/60 text-sm">
              视频加载失败
            </div>
          )}
        </div>
      )}

      {/* 主信息 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-800">{record.songName || '未命名曲目'}</h1>
            {record.danceType && (
              <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                {record.danceType}
              </span>
            )}
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ml-3 ${
            isGood ? 'bg-dpink-100 text-dpink-400' : 'bg-dpurple-50 text-dpurple-400'
          }`}>
            {isGood ? <><GoodIcon size={16} /> 跳得很好</> : '🔥 还需要努力'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-50 pt-3">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <rect x={3} y={4} width={18} height={18} rx={2} /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {formatDate(record.date)}
          </div>
          {record.duration > 0 && (
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <circle cx={12} cy={12} r={9} /><path d="M12 7v5l3 3" />
              </svg>
              {formatDuration(record.duration)}
            </div>
          )}
        </div>
      </div>

      {/* 备注 */}
      {record.notes && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">备注</h3>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{record.notes}</p>
        </div>
      )}

      {/* AI 分析按钮 */}
      <button
        onClick={() => navigate(`/record/${id}/analyze`, { state: { record } })}
        className="w-full bg-gradient-to-r from-dpink-400 to-dpurple-400 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-dpink-200 mb-4 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
          <path d="M12 2l2.4 7.2L22 9l-6 4.8L17.6 22 12 17l-5.6 5L8 13.8 2 9l7.6-.2z" />
        </svg>
        AI 动作分析
      </button>

      <div className="text-center text-xs text-gray-400 mt-6">
        创建于 {formatDate(record.createdAt)}
      </div>

      {/* 删除确认 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-scale-in">
            <div className="text-center">
              <div className="text-4xl mb-3">😢</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">确认删除</h3>
              <p className="text-gray-500 text-sm">删除后无法恢复，确定要删除这条记录吗？</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-medium rounded-xl py-3">
                取消
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl py-3 transition-colors">
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
