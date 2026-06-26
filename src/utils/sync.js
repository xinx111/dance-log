/**
 * 云同步工具 - 预留智谱 API 接口
 * 后续可扩展为通过智谱 API 进行数据同步
 */

import { getSetting, setSetting, getAllRecords } from '../db'

const SYNC_KEY = 'cloud_sync_config'
const BACKUP_KEY = 'last_backup_time'

export async function getSyncConfig() {
  return (await getSetting(SYNC_KEY)) || { enabled: false }
}

export async function setSyncConfig(config) {
  return setSetting(SYNC_KEY, config)
}

export async function getLastBackupTime() {
  return (await getSetting(BACKUP_KEY)) || null
}

export async function exportData() {
  const records = await getAllRecords()
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    records,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `舞迹数据备份_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  await setSetting(BACKUP_KEY, new Date().toISOString())
  return data
}

export async function importData(jsonData) {
  const { records } = jsonData
  if (!Array.isArray(records)) {
    throw new Error('数据格式错误')
  }

  const db = (await import('../db')).default
  const count = records.length
  for (const record of records) {
    const { id, ...data } = record
    await db.danceRecords.add({
      ...data,
      createdAt: new Date(data.createdAt || Date.now()),
      updatedAt: new Date(),
    })
  }

  return { count }
}

/**
 * 智谱 AI 分析 - 预留接口
 */
export async function analyzeWithZhipu(records, type = 'summary') {
  // 后续接入智谱 API
  // const response = await fetch('https://open.bigmodel.cn/api/...', { ... })
  console.log(`[Zhipu] 分析类型: ${type}, 记录数: ${records.length}`)
  return null
}
