import React, { useState, useEffect, useRef } from 'react'
import { getStats, getUserProfile, saveUserProfile } from '../db'
import { exportData, importData, getLastBackupTime } from '../utils/sync'
import { formatDate } from '../utils/format'

export default function Profile() {
  const [stats, setStats] = useState(null)
  const [profile, setProfile] = useState({ name: '舞者', avatar: '' })
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [lastBackup, setLastBackup] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const fileInputRef = useRef(null)
  const avatarInputRef = useRef(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [statsData, backupTime, userProfile] = await Promise.all([
        getStats(), getLastBackupTime(), getUserProfile(),
      ])
      setStats(statsData)
      setLastBackup(backupTime)
      setProfile(userProfile)
    } catch (err) { console.error(err) }
  }

  function startEdit() {
    setEditName(profile.name)
    setEditAvatar(profile.avatar)
    setEditing(true)
  }

  async function saveEdit() {
    const newProfile = {
      name: editName.trim() || '舞者',
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

  const avatarContent = profile.avatar
    ? <img src={profile.avatar} alt="头像" className="w-full h-full rounded-full object-cover" />
    : <span className="text-white text-2xl font-bold">{profile.name[0]}</span>

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
                  : <span className="text-white text-3xl font-bold">{editName ? editName[0] : '舞'}</span>
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

      {/* 数据管理 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 space-y-1">
        <h3 className="text-sm font-medium text-gray-500 mb-2">数据管理</h3>
        <MenuItem icon="📤" label="导出备份" sub={lastBackup ? `上次备份: ${formatDate(lastBackup)}` : '尚未备份'} onClick={handleExport} loading={exporting} />
        <MenuItem icon="📥" label="导入备份" sub="从备份文件恢复数据" onClick={() 