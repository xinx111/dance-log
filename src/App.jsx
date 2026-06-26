import React from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import RecordList from './pages/RecordList'
import RecordForm from './pages/RecordForm'
import RecordDetail from './pages/RecordDetail'
import CalendarPage from './pages/CalendarPage'
import Summary from './pages/Summary'
import Profile from './pages/Profile'
import AIAnalyze from './pages/AIAnalyze'

const pages = [
  { path: '/', name: '首页', icon: HomeIcon },
  { path: '/calendar', name: '日历', icon: CalendarIcon },
  { path: '/summary', name: '总结', icon: ChartIcon },
  { path: '/profile', name: '我的', icon: ProfileIcon },
]

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabPaths = ['/', '/calendar', '/summary', '/profile']
  const showNav = tabPaths.includes(location.pathname)

  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#FAFAFE] relative">
      <div className={showNav ? 'pb-24' : 'pb-4'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<RecordList />} />
          <Route path="/record/new" element={<RecordForm />} />
          <Route path="/record/:id" element={<RecordDetail />} />
          <Route path="/record/:id/edit" element={<RecordForm />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/record/:id/analyze" element={<AIAnalyze />} />
        </Routes>
      </div>
      {showNav && (
        <>
          <BottomNav pages={pages} />
          {/* FAB 可爱记录按钮 */}
          <button
            onClick={() => navigate('/record/new')}
            className="fixed bottom-20 right-1/2 translate-x-[140px] w-14 h-14 bg-gradient-to-br from-dpink-300 to-dpurple-400
                       text-white rounded-2xl shadow-xl shadow-dpink-200 flex items-center justify-center
                       active:scale-90 transition-transform z-50 hover:shadow-lg"
          >
            <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-7 h-7">
              {/* 小星星 */}
              <path d="M14 3L16 11L24 11L18 16L20 24L14 19L8 24L10 16L4 11L12 11Z" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

// ===== 可爱图标 🎀 =====

function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
      {/* 小房子 - 带爱心烟囱 */}
      <path d="M3 12L14 3L25 12V23C25 24.1 24.1 25 23 25H5C3.9 25 3 24.1 3 23V12Z"
        fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <rect x={11} y={18} width={6} height={7} rx={1.5} fill={active ? 'white' : 'currentColor'} />
      {/* 小窗户 */}
      <rect x={8} y={13} width={4} height={4} rx={1} fill={active ? 'white' : 'currentColor'} opacity={active ? 1 : 0.3} />
      <rect x={16} y={13} width={4} height={4} rx={1} fill={active ? 'white' : 'currentColor'} opacity={active ? 1 : 0.3} />
      {/* 爱心烟囱 */}
      <path d="M21 7C21 5 19 4 18 5C17 4 15 5 15 7C15 9 18 11 18 11C18 11 21 9 21 7Z"
        fill={active ? '#FFB6C1' : 'none'} stroke="currentColor" strokeWidth={1.2} />
    </svg>
  )
}

function CalendarIcon({ active }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
      {/* 可爱日历本 */}
      <rect x={3} y={5} width={22} height={19} rx={3.5}
        fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} />
      {/* 圆角挂钩 */}
      <rect x={8} y={2} width={2.5} height={5} rx={1.2} fill="currentColor" />
      <rect x={17.5} y={2} width={2.5} height={5} rx={1.2} fill="currentColor" />
      {/* 横线 */}
      <line x1={5} y1={11} x2={23} y2={11} stroke={active ? 'white' : 'currentColor'} strokeWidth={1.5} opacity={active ? 1 : 0.4} />
      <line x1={5} y1={15.5} x2={23} y2={15.5} stroke={active ? 'white' : 'currentColor'} strokeWidth={1.5} opacity={active ? 1 : 0.4} />
      <line x1={5} y1={20} x2={23} y2={20} stroke={active ? 'white' : 'currentColor'} strokeWidth={1.5} opacity={active ? 1 : 0.4} />
      {/* 小爱心标记 */}
      {active && <circle cx={14} cy={13.5} r={1} fill="white" />}
      {active && <circle cx={10} cy={18} r={1} fill="white" />}
      {active && <circle cx={18} cy={18} r={1} fill="white" />}
    </svg>
  )
}

function ChartIcon({ active }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
      {/* 小苗苗 + 星星趋势 */}
      <path d="M4 23L10 15L14 19L20 9L24 13"
        stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      {/* 小苗苗叶子 */}
      <path d="M20 9C20 9 22 6 24 4"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" opacity={0.6} />
      <path d="M20 9C20 9 23 8 25 7"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" opacity={0.4} />
      {/* 星星 */}
      {active && (
        <path d="M22 4L22.5 5.5L24 6L22.5 6.5L22 8L21.5 6.5L20 6L21.5 5.5Z"
          fill="currentColor" />
      )}
    </svg>
  )
}

function ProfileIcon({ active }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6">
      {/* 小猫猫脸 */}
      <ellipse cx={14} cy={15} rx={10} ry={9}
        fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} />
      {/* 耳朵 */}
      {active ? (
        <>
          <path d="M6 10L4 4L10 8Z" fill="currentColor" />
          <path d="M22 10L24 4L18 8Z" fill="currentColor" />
        </>
      ) : (
        <>
          <path d="M6 10L4 4L10 8Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
          <path d="M22 10L24 4L18 8Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
        </>
      )}
      {/* 眼睛 */}
      <circle cx={10} cy={14} r={active ? 2 : 1.2} fill={active ? 'white' : 'currentColor'} />
      <circle cx={18} cy={14} r={active ? 2 : 1.2} fill={active ? 'white' : 'currentColor'} />
      {/* 眼睛高光 */}
      {active && (
        <>
          <circle cx={9} cy={13.5} r={0.6} fill="currentColor" />
          <circle cx={17} cy={13.5} r={0.6} fill="currentColor" />
        </>
      )}
      {/* 小鼻子 */}
      <ellipse cx={14} cy={17} rx={1.5} ry={1} fill={active ? 'white' : 'currentColor'} opacity={active ? 1 : 0.6} />
      {/* 胡须 */}
      <line x1={6} y1={17} x2={9} y2={17.5} stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
      <line x1={6} y1={19} x2={9} y2={18.5} stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
      <line x1={22} y1={17} x2={19} y2={17.5} stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
      <line x1={22} y1={19} x2={19} y2={18.5} stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
    </svg>
  )
}
