import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { AI_API_BASE } from '../utils/config'
import { getRecord, updateRecord } from '../db'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

export default function AIAnalyze() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const record = location.state?.record

  const [mode, setMode] = useState('single')  // 'single' | 'compare'
  const [myFile, setMyFile] = useState(null)
  const [teacherFile, setTeacherFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const myInputRef = useRef(null)
  const teacherInputRef = useRef(null)

  // 从记录中自动加载已录制的视频和已有分析结果
  useEffect(() => {
    async function init() {
      // 如果已有分析结果，直接显示
      if (record?.analysisResults?.[mode]) {
        setResult(record.analysisResults[mode])
      }

      // 自动加载视频
      if (!record?.videoUrl) return
      try {
        let uri = record.videoUrl
        if (!uri.startsWith('blob:') && !uri.startsWith('http')) {
          const { getVideoUri } = await import('../utils/storage')
          uri = await getVideoUri(uri)
        }
        const response = await fetch(uri)
        const blob = await response.blob()
        const ext = blob.type.includes('mp4') ? 'mp4' : 'mov'
        const file = new File([blob], `dance.${ext}`, { type: blob.type })
        setMyFile(file)
      } catch (err) {
        console.error('自动加载视频失败，请手动选择:', err)
      }
    }
    init()
  }, [record, mode])

  async function handleAnalyze() {
    if (!myFile) { alert('请选择你的舞蹈视频'); return }
    if (mode === 'compare' && !teacherFile) { alert('请选择老师的示范视频'); return }

    setAnalyzing(true)
    setError('')
    setResult(null)

    // 标记"分析中"
    try {
      const existingResults = record?.analysisResults || {}
      await updateRecord(Number(id), {
        analysisResults: {
          ...existingResults,
          [`${mode}_pending`]: true,
        },
        analyzedAt: new Date().toISOString(),
      })
    } catch (e) {
      console.error('标记分析状态失败:', e)
    }

    // ===== 以下用 .then() 确保即使页面返回，请求仍在后台执行 =====
    const formData = new FormData()

    if (mode === 'single') {
      formData.append('video', myFile)
    } else {
      formData.append('my_video', myFile)
      formData.append('teacher_video', teacherFile)
    }

    const endpoint = mode === 'single' ? '/analyze/single' : '/analyze'
    const timeoutMs = mode === 'compare' ? 300000 : 120000

    // 不 await，让请求在后台跑，页面返回也不中断
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    fetch(`${AI_API_BASE}${endpoint}`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    }).then(async (res) => {
      clearTimeout(timeoutId)

      if (!res.ok) {
        const text = await res.text()
        let msg = '分析请求失败'
        try {
          const errJson = JSON.parse(text)
          msg = errJson.detail || errJson.error || errJson.message || msg
        } catch {
          if (text.includes('connect') || text.includes('ECONNREFUSED')) msg = '无法连接到服务器，请确认服务已启动'
          else if (text.includes('timeout') || text.includes('timed out')) msg = '请求超时，视频可能过长或网络不稳定'
          else if (text.includes('500')) msg = '服务器内部错误，请查看后端日志'
          else msg = text.slice(0, 100)
        }
        throw new Error(msg)
      }

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // 保存结果到数据库（页面已关闭也能写 IndexedDB）
      const currentRecord = await getRecord(Number(id))
      const results = currentRecord?.analysisResults || {}
      const { [`${mode}_pending`]: _, ...rest } = results
      await updateRecord(Number(id), {
        analysisResults: { ...rest, [mode]: data },
        analyzedAt: new Date().toISOString(),
      })
    }).catch(async (err) => {
      console.error('后台分析失败:', err)
      try {
        const currentRecord = await getRecord(Number(id))
        const results = currentRecord?.analysisResults || {}
        const { [`${mode}_pending`]: _, ...rest } = results
        await updateRecord(Number(id), {
          analysisResults: { ...rest, [`${mode}_error`]: err.message },
        })
      } catch (_) {}
    })
  }

  const radarData = result ? [
    { dimension: '控制力', score: result.dimensions?.control || 0 },
    { dimension: '姿态', score: result.dimensions?.posture || 0 },
    { dimension: '流畅度', score: result.dimensions?.flow || 0 },
    { dimension: '节奏感', score: result.dimensions?.rhythm || 0 },
    { dimension: '表现力', score: result.dimensions?.expression || 0 },
  ] : []

  return (
    <div className="px-4 pt-6 pb-8 animate-fade-in">
      {/* 返回 */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-gray-600">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">AI 动作分析</h1>
      </div>

      {/* 记录信息 */}
      {record && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mb-4">
          <p className="font-medium text-gray-800">{record.songName || '未命名'}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            {record.danceType && <span>{record.danceType}</span>}
            {record.danceType && record.duration > 0 && <span>·</span>}
            {record.duration > 0 && <span>{Math.floor(record.duration / 60)}:{String(record.duration % 60).padStart(2, '0')}</span>}
          </div>
        </div>
      )}

      {/* 模式切换 */}
      <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-50 inline-flex mb-5">
        <button onClick={() => setMode('single')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'single' ? 'bg-dpink-400 text-white shadow-sm' : 'text-gray-500'
          }`}>
          独立点评
        </button>
        <button onClick={() => setMode('compare')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'compare' ? 'bg-dpurple-400 text-white shadow-sm' : 'text-gray-500'
          }`}>
          对比分析
        </button>
      </div>

      {/* 视频选择 */}
      <div className="space-y-3 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <label className="text-sm font-medium text-gray-700 mb-2 block">我的舞蹈视频</label>
          <div
            onClick={() => myInputRef.current?.click()}
            className="bg-dpink-50 rounded-xl py-4 text-center cursor-pointer hover:bg-dpink-100 transition-colors border border-dashed border-dpink-200"
          >
            {myFile ? (
              <div>
                <div className="text-sm text-dpink-500 font-medium">{myFile.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{(myFile.size / 1024 / 1024).toFixed(1)} MB</div>
              </div>
            ) : (
              <div>
                <div className="text-2xl mb-1">🎬</div>
                <p className="text-gray-500 text-sm">选择视频文件</p>
              </div>
            )}
          </div>
          <input ref={myInputRef} type="file" accept="video/*" className="hidden" onChange={e => setMyFile(e.target.files?.[0])} />
        </div>

        {mode === 'compare' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <label className="text-sm font-medium text-gray-700 mb-2 block">老师示范视频</label>
            <div
              onClick={() => teacherInputRef.current?.click()}
              className="bg-dpurple-50 rounded-xl py-4 text-center cursor-pointer hover:bg-dpurple-100 transition-colors border border-dashed border-dpurple-200"
            >
              {teacherFile ? (
                <div>
                  <div className="text-sm text-dpurple-500 font-medium">{teacherFile.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{(teacherFile.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl mb-1">🎓</div>
                  <p className="text-gray-500 text-sm">选择老师示范视频</p>
                </div>
              )}
            </div>
            <input ref={teacherInputRef} type="file" accept="video/*" className="hidden" onChange={e => setTeacherFile(e.target.files?.[0])} />
          </div>
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={analyzing}
        className="w-full bg-gradient-to-r from-dpink-400 to-dpurple-400 text-white font-bold text-lg py-4 rounded-2xl shadow-lg disabled:opacity-60 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mb-6"
      >
        {analyzing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            已开始分析，返回后可查看进度
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
              <path d="M12 2l2.4 7.2L22 9l-6 4.8L17.6 22 12 17l-5.6 5L8 13.8 2 9l7.6-.2z" />
            </svg>
            {mode === 'compare' ? '开始对比分析' : '开始分析'}
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 -mt-4 mb-4">开始后可以自由浏览，分析完成后结果会自动保存</p>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
          <p className="text-red-500 text-sm font-medium">分析失败</p>
          <p className="text-red-400 text-xs mt-1">{error}</p>
        </div>
      )}

      {result && !error && (
        <div className="space-y-5 animate-slide-up">
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#FFB6C1" strokeWidth="8"
                  strokeDasharray={`${result.totalScore * 2.64} 264`}
                  strokeLinecap="round" transform="rotate(-90, 50, 50)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-800">{result.totalScore}</span>
                <span className="text-xs text-gray-400">综合评分</span>
              </div>
            </div>
          </div>

          {radarData.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
              <h3 className="text-sm font-bold text-gray-800 mb-3">各维度评分</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#f0f0f0" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#666' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="评分" dataKey="score" stroke="#FFB6C1" fill="#FFB6C1" fillOpacity={0.3} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {radarData.map(d => (
                  <div key={d.dimension} className="text-center">
                    <div className="text-sm font-bold text-dpink-400">{d.score}</div>
                    <div className="text-[10px] text-gray-400 truncate">{d.dimension}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.problems?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>⚠️</span> 需要改进
              </h3>
              <ul className="space-y-2">
                {result.problems.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-orange-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.tips?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>💡</span> 改进建议
              </h3>
              <ul className="space-y-2">
                {result.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-dpink-400 mt-0.5 flex-shrink-0">→</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.strengths?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>✅</span> 做得好的地方
              </h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-dance-green mt-0.5 flex-shrink-0">★</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!result.dimensions?.control && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
              ⚠️ AI 返回的数据格式异常，请检查服务器日志或 API Key 配置
            </div>
          )}
        </div>
      )}
    </div>
  )
}
