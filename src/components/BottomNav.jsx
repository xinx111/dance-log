import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav({ pages }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-lg border-t border-gray-100 pb-safe z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {pages.map((page) => {
          const isActive = location.pathname === page.path
          return (
            <button
              key={page.path}
              onClick={() => navigate(page.path)}
              className={`flex flex-col items-center justify-center w-16 py-1 transition-all duration-200 ${
                isActive ? 'scale-100' : 'scale-95'
              }`}
            >
              <div className={`transition-colors duration-200 ${
                isActive ? 'text-dpink-400' : 'text-gray-400'
              }`}>
                {React.createElement(page.icon, { active: isActive })}
              </div>
              <span className={`text-xs mt-0.5 font-medium transition-colors duration-200 ${
                isActive ? 'text-dpink-400' : 'text-gray-400'
              }`}>
                {page.name}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
