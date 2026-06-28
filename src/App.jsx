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
  { path: '/profile', name: '我的', icon: ProfileIcon },
]

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabPaths = ['/', '/calendar', '/profile']
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

function ProfileIcon({ active }) {
  const o = active ? 1 : 0.35
  return (
    <svg viewBox="0 0 1024 1024" className="w-6 h-6" style={{ filter: active ? 'none' : 'grayscale(1)' }}>
      <path d="M762.88 372.94H624.73c12.98-20.37 20.5-44.56 20.5-70.51 0-72.59-58.85-131.44-131.44-131.44s-131.44 58.85-131.44 131.44c0 25.95 7.52 50.13 20.5 70.51H264.12c-40.38 0-73.12 32.74-73.12 73.12s32.74 73.12 73.12 73.12H392.8V636.1L292.74 736.16c-28.55 28.55-28.55 74.85 0 103.4 28.55 28.55 74.85 28.55 103.4 0l128.62-128.62 128.62 128.62c28.55 28.55 74.85 28.55 103.4 0 28.55-28.55 28.55-74.85 0-103.4L634.77 614.15v-94.96h128.1c40.38 0 73.12-32.74 73.12-73.12s-32.74-73.12-73.12-73.12z" fill="#FCCF8D" opacity={o} />
      <path d="M466.78 268.96m-20.6 0a20.6 20.6 0 1 0 41.2 0 20.6 20.6 0 1 0-41.2 0Z" fill="#4A7F46" opacity={o} />
      <path d="M567.25 268.96m-20.6 0a20.6 20.6 0 1 0 41.2 0 20.6 20.6 0 1 0-41.2 0Z" fill="#4A7F46" opacity={o} />
      <path d="M580.81 317.68c0 37.18-30.14 67.31-67.31 67.31s-67.31-30.14-67.31-67.31" fill="#F97319" opacity={o} />
      <path d="M525.8 552.25m-24.35 0a24.35 24.35 0 1 0 48.7 0 24.35 24.35 0 1 0-48.7 0Z" fill="#FFFFFF" opacity={o} />
      <path d="M525.8 607.79m-24.35 0a24.35 24.35 0 1 0 48.7 0 24.35 24.35 0 1 0-48.7 0Z" fill="#FFFFFF" opacity={o} />
      <path d="M780.45 273.07c0-12.38-7.74-24.75-23.2-24.75-13.93 0-20.11 12.38-20.11 12.38s-6.19-12.38-20.11-12.38c-15.47 0-23.21 12.38-23.21 24.75 0 18.56 17.13 33.71 34.61 44.48a16.589 16.589 0 0 0 17.41 0c17.48-10.77 34.61-25.92 34.61-44.48zM557.02 484.3c0-8.9-5.56-17.81-16.69-17.81-10.02 0-14.47 8.9-14.47 8.9s-4.45-8.9-14.47-8.9c-11.13 0-16.69 8.9-16.69 17.81 0 13.35 12.32 24.25 24.9 32a11.93 11.93 0 0 0 12.53 0c12.57-7.75 24.89-18.65 24.89-32z" fill="#F97319" opacity={o} />
    </svg>
  )
}
