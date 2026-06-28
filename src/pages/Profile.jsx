import React, { useState, useEffect, useRef } from 'react'
import { getStats, getUserProfile, saveUserProfile, clearAllRecords, getStorageStats } from '../db'
import { exportData, importData, getLastBackupTime } from '../utils/sync'
import { formatDate } from '../utils/format'
import DefaultAvatar from '../components/DefaultAvatar'
import BackupIcon from '../components/BackupIcon'
import DeleteIcon from '../components/DeleteIcon'
import StorageIcon from '../components/StorageIcon'

export default function Profile() {
  const [stats, setStats] = useState(null)
  const [profile, setProfile] = useState({ name: 'xin', avatar: '' })
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [lastBackup, setLastBackup] = useState(null)
  const [storageStats, setStorageStats] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearConfirmText, setClearConfirmText] = useState('')
  const [clearing, setClearing] = useState(false)
  const fileInputRef = useRef(null)
  const avatarInputRef = useRef(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [statsData, backupTime, userProfile, storage] = await Promise.all([
        getStats(), getLastBackupTime(), getUserProfile(), getStorageStats(),
      ])
      setStats(statsData)
      setLastBackup(backupTime)
      setProfile(userProfile)
      setStorageStats(storage)
    } catch (err) { console.error(err) }
  }

  function startEdit() {
    setEditName(profile.name)
    setEditAvatar(profile.avatar)
    setEditing(true)
  }

  async function saveEdit() {
    const newProfile = {
      name: editName.trim() || 'xin',
      avatar: editAvatar,
    }
    await saveUserProfile(newProfile)
    setProfile(newProfile)
    setEditing(false)
  }

  function handleAvatarSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setEditAvatar(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function handleExport() {
    setExporting(true)
    try { exportData() } catch (err) { alert('导出失败') }
    setExporting(false)
  }

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const result = await importData(data)
      setImportResult({ success: true, count: result.count })
      await loadData()
    } catch (err) { setImportResult({ success: false, message: err.message }) }
    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleClearAll() {
    setClearing(true)
    try {
      await clearAllRecords()
      await loadData()
      setShowClearConfirm(false)
      setClearConfirmText('')
    } catch (err) {
      alert('清除失败，请重试')
    }
    setClearing(false)
  }

  const avatarContent = profile.avatar
    ? <img src={profile.avatar} alt="头像" className="w-full h-full rounded-full object-cover" />
    : <DefaultAvatar className="w-full h-full" />

  return (
    <div className="px-4 pt-6 pb-4 space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">我的</h1>
      <p className="text-gray-400 text-sm -mt-4 mb-2">个人资料与设置</p>

      {/* 用户信息 — 可点击编辑 */}
      <div
        onClick={startEdit}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex items-center gap-4 cursor-pointer active:scale-[0.99] transition-transform"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-dpink-200 to-dpurple-400 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
          {avatarContent}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800">{profile.name}</h2>
          <p className="text-gray-400 text-sm">舞迹 DanceLog · 点击编辑资料</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-gray-300">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </div>

      {/* 编辑弹窗 */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-scale-in">
            <h3 className="text-lg font-bold text-gray-800 mb-4">编辑资料</h3>

            {/* 头像 */}
            <div className="flex flex-col items-center mb-4">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-dpink-200 to-dpurple-400 flex items-center justify-center shadow-lg overflow-hidden cursor-pointer mb-2 relative group"
              >
                {editAvatar
                  ? <img src={editAvatar} alt="头像" className="w-full h-full rounded-full object-cover" />
                  : <DefaultAvatar className="w-full h-full" />
                }
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-6 h-6">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx={12} cy={13} r={4} />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-400">点击更换头像</p>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            </div>

            {/* 昵称 */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">昵称</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="输入你的昵称"
                className="input-field"
                maxLength={20}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditing(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-medium rounded-xl py-3">
                取消
              </button>
              <button onClick={saveEdit}
                className="flex-1 bg-gradient-to-r from-dpink-400 to-dpurple-400 text-white font-medium rounded-xl py-3">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 数据统计 */}
      {stats && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h3 className="text-sm font-medium text-gray-500 mb-3">数据概览</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-dpink-400">{stats.totalRecords}</p>
              <p className="text-xs text-gray-400">总记录</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-dpurple-400">{stats.monthRecords}</p>
              <p className="text-xs text-gray-400">本月新增</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-dpink-400">{stats.practiceDays}</p>
              <p className="text-xs text-gray-400">本月打卡</p>
            </div>
          </div>
        </div>
      )}

      {/* 存储状态 */}
      {storageStats && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-1.5"><StorageIcon size={18} /> 存储状态</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-dpink-400">
                {storageStats.withVideo}
              </p>
              <p className="text-xs text-gray-400">含视频的记录</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-dpurple-400">
                {storageStats.totalBytes > 0
                  ? storageStats.totalBytes >= 1073741824
                    ? `${(storageStats.totalBytes / 1073741824).toFixed(1)} GB`
                    : `${(storageStats.totalBytes / 1048576).toFixed(1)} MB`
                  : '—'}
              </p>
              <p className="text-xs text-gray-400">视频占用空间</p>
            </div>
          </div>
          {storageStats.withoutVideo > 0 && (
            <p className="text-xs text-gray-400 text-center mt-2">
              另有 {storageStats.withoutVideo} 条无视频的记录未计入
            </p>
          )}
          {storageStats.totalBytes === 0 && storageStats.totalRecords > 0 && (
            <p className="text-xs text-amber-500 text-center mt-2">
              部分旧记录的存储空间暂未统计，新录制视频后将自动计算
            </p>
          )}
        </div>
      )}

      {/* 数据管理 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 space-y-1">
        <h3 className="text-sm font-medium text-gray-500 mb-2">数据管理</h3>
        <MenuItem icon={<BackupIcon size={20} />} label="导出备份" sub={lastBackup ? `上次备份: ${formatDate(lastBackup)}` : '尚未备份'} onClick={handleExport} loading={exporting} />
        <MenuItem icon={<BackupIcon size={20} className="-scale-x-100" />} label="导入备份" sub="从备份文件恢复数据" onClick={() => fileInputRef.current?.click()} loading={importing} />
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        {importResult && (
          <div className={`mt-2 text-sm px-3 py-2 rounded-lg ${
            importResult.success ? 'bg-dpink-50 text-dpink-400' : 'bg-red-50 text-red-500'
          }`}>
            {importResult.success ? `✓ 成功导入 ${importResult.count} 条记录` : `✗ 导入失败: ${importResult.message}`}
          </div>
        )}

        <div className="border-t border-gray-50 pt-2 mt-2">
          <button onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center gap-3 py-3 rounded-xl px-2 -mx-2 transition-colors text-red-500 active:bg-red-50">
            <div className="w-8 flex items-center justify-center"><DeleteIcon size={20} /></div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">清除所有数据</p>
              <p className="text-xs text-gray-400">删除全部舞蹈记录，不可恢复</p>
            </div>
          </button>
        </div>
      </div>

      {/* 清除确认弹窗 */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-scale-in">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">清除所有数据</h3>
              <p className="text-gray-500 text-sm">此操作将删除所有舞蹈记录，不可恢复。<br/>建议先导出备份。</p>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">请输入 <strong className="text-red-500">确认</strong> 以继续</label>
              <input type="text" value={clearConfirmText} onChange={e => setClearConfirmText(e.target.value)}
                placeholder="输入" className="input-field" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowClearConfirm(false); setClearConfirmText('') }}
                className="flex-1 bg-gray-100 text-gray-700 font-medium rounded-xl py-3">
                取消
              </button>
              <button onClick={handleClearAll} disabled={clearConfirmText !== '确认' || clearing}
                className="flex-1 bg-red-500 text-white font-medium rounded-xl py-3 disabled:opacity-50 transition-colors">
                {clearing ? '清除中...' : '确认清除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 关于 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <button onClick={() => setShowAbout(!showAbout)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-dpink-400">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
</svg>
            <div className="text-left">
              <p className="font-medium text-gray-800">关于舞迹</p>
              <p className="text-xs text-gray-400">版本 1.0.0</p>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
               className={`w-5 h-5 text-gray-400 transition-transform ${showAbout ? 'rotate-180' : ''}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {showAbout && (
          <div className="mt-3 pt-3 border-t border-gray-50 text-sm text-gray-500 space-y-2 animate-slide-up">
            <p>舞迹 DanceLog 是一款帮助舞蹈爱好者记录练习视频的应用。</p>
            <p>通过分类、日历、数据统计和成长总结，看到自己的进步轨迹。</p>
            <p className="text-xs text-gray-400 mt-2">技术栈: React + Vite + Tailwind + IndexedDB</p>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-400 pb-4">舞迹 DanceLog © 2026</div>
    </div>
  )
}

function MenuItem({ icon, label, sub, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="w-full flex items-center gap-3 py-3 active:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors">
      <div className="w-8 flex items-center justify-center">{icon}</div>
      <div className="flex-1 text-left">
        <p className="font-medium text-gray-800 text-sm">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      {loading ? (
        <div className="w-4 h-4 border-2 border-gray-300 border-t-dpink-400 rounded-full animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-300">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  )
}
