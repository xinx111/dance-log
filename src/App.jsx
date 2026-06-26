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

