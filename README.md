# 舞迹 DanceLog 🕺💃

帮助舞蹈爱好者记录练习视频，并通过分类、日历、数据统计和成长总结看到自己的进步轨迹。

## 功能

- **首页** - 今日练习提醒、调得很好/还需努力卡片、本月统计
- **记录** - 上传视频、输入歌曲、选择日期、舞种分类、标签备注
- **日历** - 月视图彩色标记、连续练习天数、点击日期查看记录
- **总结** - 周报月报、趋势图表、舞种分布、分类占比
- **我的** - 数据备份导出/导入、云同步设置

## 技术栈

- **框架**: React 18 + Vite
- **样式**: Tailwind CSS 3
- **路由**: React Router 6
- **存储**: Dexie.js (IndexedDB)
- **图表**: Recharts
- **PWA**: vite-plugin-pwa
- **混合应用**: Capacitor 6 (Android APK)

## 开始使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 打包 Android APK

```bash
# 构建前端
npm run build

# 初始化 Capacitor（首次）
npx cap init DanceLog com.dancelog.app
npx cap add android

# 同步并打开 Android Studio
npx cap sync
npx cap open android
```

## 配色

| 用途 | 颜色 |
|------|------|
| 粉色主色 | #FFB6C1 |
| 紫色辅助 | #8E7DFE |
| 强调粉 | #FF6B9A |
| 强调紫 | #7C3AED |
| 背景 | #FAFAFE |

## 项目结构

```
dance-log/
├── public/            # 静态资源
│   ├── manifest.json  # PWA 配置
│   └── icons/         # 应用图标
├── src/
│   ├── main.jsx       # 入口
│   ├── App.jsx        # 路由 & 导航
│   ├── index.css      # 全局样式
│   ├── components/    # 通用组件
│   │   └── BottomNav.jsx
│   ├── pages/         # 页面
│   │   ├── Home.jsx        # 首页
│   │   ├── Record.jsx      # 记录页
│   │   ├── RecordDetail.jsx # 记录详情
│   │   ├── CalendarPage.jsx # 日历页
│   │   ├── Summary.jsx      # 总结页
│   │   └── Profile.jsx      # 我的
│   ├── db/            # 数据库
│   │   └── index.js   # Dexie 配置
│   └── utils/         # 工具函数
│       ├── format.js  # 格式化
│       └── sync.js    # 云同步
├── capacitor.config.json
├── vite.config.js
├── tailwind.config.js
└── package.json
```
