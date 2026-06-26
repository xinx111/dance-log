/**
 * 格式化日期为中文格式
 */
export function formatDate(date, format = 'long') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[d.getDay()]

  if (format === 'short') {
    return `${month}/${day}`
  }
  if (format === 'weekday') {
    return `周${weekday}`
  }
  if (format === 'full') {
    return `${year}年${month}月${day}日 周${weekday}`
  }
  return `${year}年${month}月${day}日`
}

/**
 * 格式化时长（秒 -> 分钟:秒）
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

/**
 * 格式化时长（秒 -> 中文）
 */
export function formatDurationCN(seconds) {
  if (!seconds || seconds <= 0) return '0 分钟'
  const min = Math.floor(seconds / 60)
  if (min < 60) return `${min} 分钟`
  const hours = Math.floor(min / 60)
  const mins = min % 60
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`
}

/**
 * 格式化月份
 */
export function formatMonth(year, month) {
  return `${year}年${month}月`
}

export function getMonthDays(year, month) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const days = []

  // 填充前面空白
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null)
  }

  // 填充日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(i)
  }

  return days
}

/**
 * 获取日期字符串 YYYY-MM-DD
 */
export function getDateStr(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}
