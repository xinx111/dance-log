import Dexie from 'dexie'

const db = new Dexie('DanceLog')

db.version(1).stores({
  danceRecords: '++id, date, songName, danceType, category, createdAt',
  practiceSessions: '++id, date',
  settings: '&key',
})

// 默认舞种列表
export const DANCE_TYPES = [
  'Jazz',
  'K-Pop',
  'Hip-Hop',
  'Urban',
  '现代舞',
  '中国舞',
  '拉丁',
  '芭蕾',
  'Popping',
  'Locking',
  'Breaking',
  'Waacking',
  'Voguing',
  'Heels',
  '编舞',
  '其他',
]

export async function addRecord(record) {
  return db.danceRecords.add({
    ...record,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function updateRecord(id, changes) {
  return db.danceRecords.update(id, {
    ...changes,
    updatedAt: new Date(),
  })
}

export async function deleteRecord(id) {
  return db.danceRecords.delete(id)
}

export async function getRecord(id) {
  return db.danceRecords.get(id)
}

export async function getAllRecords() {
  return db.danceRecords.orderBy('date').reverse().toArray()
}

export async function getRecordsByDate(date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return db.danceRecords
    .where('date')
    .between(start.getTime(), end.getTime())
    .toArray()
}

export async function getRecordsByMonth(year, month) {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59, 999)
  return db.danceRecords
    .where('date')
    .between(start.getTime(), end.getTime())
    .toArray()
}

export async function getRecordsByCategory(category) {
  return db.danceRecords
    .where('category')
    .equals(category)
    .reverse()
    .toArray()
}

export async function getRecentRecords(limit = 6) {
  return db.danceRecords
    .orderBy('date')
    .reverse()
    .limit(limit)
    .toArray()
}

export async function getStats() {
  const records = await db.danceRecords.toArray()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthRecords = records.filter(r => new Date(r.date) >= monthStart)

  // 本月打卡天数
  const practiceDays = new Set(
    monthRecords.map(r => new Date(r.date).toDateString())
  ).size

  // 本月总时长
  const totalDuration = monthRecords.reduce((sum, r) => sum + (r.duration || 0), 0)

  // 总记录数
  const totalRecords = records.length

  // 舞种分布
  const danceTypeDist = {}
  monthRecords.forEach(r => {
    if (r.danceType) {
      danceTypeDist[r.danceType] = (danceTypeDist[r.danceType] || 0) + 1
    }
  })

  // 总练习天数
  const totalDays = new Set(
    records.map(r => new Date(r.date).toDateString())
  ).size

  return {
    totalRecords,
    monthRecords: monthRecords.length,
    practiceDays,
    totalDuration,
    danceTypeDist,
    totalDays,
  }
}

export async function getAllPracticeDates() {
  const records = await db.danceRecords.toArray()
  return [...new Set(records.map(r => new Date(r.date).toDateString()))]
    .map(d => new Date(d))
}

/** 获取总练习天数 */
export async function getTotalPracticeDays() {
  const records = await db.danceRecords.toArray()
  return new Set(
    records.map(r => new Date(r.date).toDateString())
  ).size
}

// ===== 设置 =====
export async function getSetting(key) {
  const row = await db.settings.get(key)
  return row?.value
}

export async function setSetting(key, value) {
  return db.settings.put({ key, value })
}

/**
 * 按时间范围获取统计
 * @param {'week'|'month'|'year'} range
 */
export async function getStatsByRange(range = 'month') {
  const records = await db.danceRecords.toArray()
  const now = new Date()
  let start

  if (range === 'week') {
    const dayOfWeek = now.getDay()
    start = new Date(now)
    start.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    start.setHours(0, 0, 0, 0)
  } else if (range === 'year') {
    start = new Date(now.getFullYear(), 0, 1)
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const rangeRecords = records.filter(r => new Date(r.date) >= start)
  const practiceDays = new Set(rangeRecords.map(r => new Date(r.date).toDateString())).size
  const totalDuration = rangeRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
  const totalRecords = records.length

  const danceTypeDist = {}
  rangeRecords.forEach(r => {
    if (r.danceType) danceTypeDist[r.danceType] = (danceTypeDist[r.danceType] || 0) + 1
  })

  // 总练习天数
  const totalDays = new Set(
    records.map(r => new Date(r.date).toDateString())
  ).size

  return {
    totalRecords,
    rangeRecords: rangeRecords.length,
    practiceDays,
    totalDuration,
    danceTypeDist,
    totalDays,
    rangeLabel: range === 'week' ? '本周' : range === 'year' ? '本年' : '本月',
  }
}

// ===== 用户资料 =====
const USER_PROFILE_KEY = 'user_profile'

export async function getUserProfile() {
  const profile = await getSetting(USER_PROFILE_KEY)
  return profile || { name: 'xin', avatar: '' }
}

export async function saveUserProfile(profile) {
  return setSetting(USER_PROFILE_KEY, profile)
}

/** 清空所有舞蹈记录（保留用户资料和设置） */
export async function clearAllRecords() {
  await db.danceRecords.clear()
}

/** 获取视频存储统计 */
export async function getStorageStats() {
  const records = await db.danceRecords.toArray()
  const videoRecords = records.filter(r => r.videoUrl)
  const totalBytes = videoRecords.reduce((sum, r) => sum + (r.fileSize || 0), 0)
  const withVideo = videoRecords.length
  const withoutVideo = records.length - withVideo
  return { totalRecords: records.length, withVideo, withoutVideo, totalBytes }
}

export default db
