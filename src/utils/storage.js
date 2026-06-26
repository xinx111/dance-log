/**
 * 视频文件存储
 * - APK 环境：通过 Capacitor Filesystem 存到 Android/data/com.dancelog.app/files/videos/
 * - 浏览器环境：退化为 blob URL（开发调试用，刷新会丢）
 */
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'

export const isNative = Capacitor.isNativePlatform()

/** 从 File 对象读取 base64 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 保存视频文件到 App 私有目录
 * @param {File} file - 从文件选择器获取的视频文件
 * @returns {string} 存储的相对路径（存入 IndexedDB）
 */
export async function saveVideo(file) {
  if (!isNative) {
    // 浏览器模式：返回 blob URL（仅开发调试用，刷新会丢）
    return URL.createObjectURL(file)
  }

  const ext = file.name.split('.').pop() || 'mp4'
  const filename = `videos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  try {
    // 确保 videos 目录存在
    await Filesystem.mkdir({
      path: 'videos',
      directory: Directory.Data,
      recursive: true,
    }).catch(() => {}) // 已存在则忽略

    // 读取文件并写入 App 私有目录
    const base64 = await fileToBase64(file)
    await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Data,
    })

    return filename
  } catch (err) {
    console.error('保存视频失败:', err)
    throw new Error('视频保存失败，请重试')
  }
}

/**
 * 获取视频的可播放 URI
 * @param {string} path - 存储的相对路径
 * @returns {Promise<string>} 可直接给 <video src> 的 URI
 */
export async function getVideoUri(path) {
  if (!path) return ''

  // blob URL / http/https 直链 直接返回
  if (path.startsWith('blob:') || path.startsWith('http')) return path

  // Capacitor 路径 -> 解析为可播放 URI
  if (isNative) {
    try {
      const result = await Filesystem.getUri({
        path,
        directory: Directory.Data,
      })
      return result.uri
    } catch (err) {
      console.error('获取视频 URI 失败:', err)
      return ''
    }
  }

  return path
}

/**
 * 删除视频文件
 * @param {string} path - 存储的相对路径
 */
export async function deleteVideoFile(path) {
  if (!path || path.startsWith('blob:') || path.startsWith('http')) return

  if (isNative) {
    try {
      await Filesystem.deleteFile({
        path,
        directory: Directory.Data,
      })
    } catch (err) {
      console.warn('删除视频文件失败:', err)
    }
  }
}
