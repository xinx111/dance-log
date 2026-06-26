import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addRecord, updateRecord, getRecord, DANCE_TYPES } from '../db'
import { getDateStr } from '../utils/format'
import { saveVideo, getVideoUri } from '../utils/storage'

export default function RecordForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    videoUrl: '',
    songName: '',
    danceType: '',
    date: getDateStr(new Date()),
    duration: 0,
    category: '',
    notes: '',
  })
  const [videoPreview, setVideoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [videoSaving, setVideoSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [formLoaded, setFormLoaded] = useState(false)
  const [showDanceTypes, setShowDanceTypes] = useState(false)
  const fileInputRef = useRef(null)

  // 编辑模式：加载现有数据
  useEffect(() => {
    if (isEdit && id) {
      loadRecord(Number(id))
    }
  }, [id])

  async function loadRecord(recordId) {
    try {
      const data = await getRecord(recordId)
      if (data) {
        setForm({
          videoUrl: data.videoUrl || '',
          songName: data.songName || '',
          danceType: data.danceType || '',
          date: new Date(data.date).toISOString().slice(0, 10),
          duration: data.duration || 0,
          category: data.category || '',
          notes: data.notes || '',
        })
        // 如果有视频，加载预览
        if (data.videoUrl) {
          const uri = await getVideoUri(data.videoUrl)
          setVideoPreview(uri)
        }
        setFormLoaded(true)
      }
    } catch (err) {
      console.error('加载记录失败:', err)
    }
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleVideoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 先显示预览
    const previewUrl = URL.createObjectURL(file)
    setVideoPreview(previewUrl)
    setSelectedFile(file)

    // 获取视频时长
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      handleChange('duration', Math.round(video.duration))
      URL.revokeObjectURL(video.src)
    }
    video.src = previewUrl
  }

  const handleSave = async () => {
    if (!form.songName.trim()) { alert('请输入歌曲名称'); return }
    if (!form.danceType) { alert('请选择舞种'); return }
    if (!form.category) { alert('请选择分类'); return }

    setSaving(true)
    try {
      let videoUrl = form.videoUrl

      // 如果有新选择的视频文件，保存到 App 目录
      if (selectedFile) {
        setVideoSaving(true)
        videoUrl = await saveVideo(selectedFile)
        setVideoSaving(false)
      }

      const recordData = {
        ...form,
        videoUrl,
        date: new Date(form.date).getTime(),
      }

      if (isEdit) {
        await updateRecord(Number(id), recordData)
      } else {
        await addRecord(recordData)
      }
      navigate(-1)
    } catch (err) {
      console.error('保存失败:', err)
      alert(err.message || '保存失败，请重试')
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-gray-600">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">
          {isEdit ? '编辑记录' : '记录舞蹈'}
        </h1>
        <div className="w-8" />
      </div>

      {/* 视频上传 */}
      <div className="px-4 mb-5">
        {videoPreview ? (
          <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg">
            <video src={videoPreview} className="w-full max-h-72 object-contain" controls />
            <button
              onClick={() => { setVideoPreview(''); setSelectedFile(null); handleChange('videoUrl', ''); handleChange('duration', 0) }}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-dpink-50 rounded-2xl py-14 text-center cursor-pointer hover:bg-dpink-100 transition-colors border-2 border-dashed border-dpink-200"
          >
            <div className="text-5xl mb-3">🎬</div>
            <p className="text-gray-600 font-medium">点击上传舞蹈视频</p>
            <p className="text-gray-400 text-xs mt-1">支持 mp4, mov 格式</p>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
      </div>

      {/* 视频保存中的提示 */}
      {videoSaving && (
        <div className="px-4 mb-4">
          <div className="bg-dpink-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-dpink-300 border-t-dpink-400 rounded-full animate-spin" />
            <span className="text-sm text-dpink-500">视频正在保存到本地...</span>
          </div>
        </div>
      )}

      {/* 表单 */}
      <div className="px-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">歌曲名称</label>
          <input type="text" value={form.songName} onChange={e => handleChange('songName', e.target.value)}
            placeholder="输入歌曲名称" className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">练习日期</label>
          <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)}
            className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">舞种</label>
          <div className="relative">
            <button
              onClick={() => setShowDanceTypes(!showDanceTypes)}
              className="input-field text-left flex items-center justify-between"
            >
              <span className={form.danceType ? 'text-gray-800' : 'text-gray-400'}>
                {form.danceType || '选择舞种'}
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                   className={`w-5 h-5 text-gray-400 transition-transform ${showDanceTypes ? 'rotate-180' : ''}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {showDanceTypes && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                {DANCE_TYPES.map(type => (
                  <button key={type}
                    onClick={() => { handleChange('danceType', type); setShowDanceTypes(false) }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                      form.danceType === type ? 'text-dpink-400 font-medium bg-dpink-50' : 'text-gray-700'
                    }`}>
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 分类 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">分区标签</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleChange('category', 'good')}
              className={`py-4 rounded-2xl border-2 text-center transition-all ${
                form.category === 'good'
                  ? 'border-dpink-200 bg-dpink-50 text-dpink-400'
                  : 'border-gray-100 bg-gray-50 text-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">🌟</div>
              <span className="font-bold text-sm">跳得很好</span>
            </button>
            <button
              onClick={() => handleChange('category', 'needs-work')}
              className={`py-4 rounded-2xl border-2 text-center transition-all ${
                form.category === 'needs-work'
                  ? 'border-dpurple-400 bg-dpurple-50 text-dpurple-400'
                  : 'border-gray-100 bg-gray-50 text-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">🔥</div>
              <span className="font-bold text-sm">还需要努力</span>
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">备注</label>
          <textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)}
            placeholder="记录一下今天的感受吧～" rows={3} className="input-field resize-none" />
        </div>
      </div>

      {/* 保存按钮 - 粉紫渐变 */}
      <div className="px-4 mt-6 pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-dpink-400 to-dpurple-400 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-dpink-200 active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              保存
            </>
          )}
        </button>
      </div>
    </div>
  )
}
