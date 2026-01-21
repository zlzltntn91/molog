import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Moon, Sun } from 'lucide-react'

interface HeaderProps {
  isDarkMode: boolean
  toggleTheme: () => void
}

export default function Header({ isDarkMode, toggleTheme }: HeaderProps) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isMainPage = location.pathname === '/main'

  const showBackButton = !isHomePage && !isMainPage

  return (
    <header className="flex-none h-14 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md flex items-center px-4 z-50 sticky top-0 border-b border-transparent dark:border-white/5 justify-between transition-colors duration-300 ease-in-out">
      {/* Left Area: Back Button or Title */}
      <div className="flex items-center justify-start z-10">
        {isMainPage ? (
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">Molog</span>
        ) : showBackButton ? (
          <Link 
            to={-1 as any} // History back
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300 ease-in-out text-gray-900 dark:text-white"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
        ) : null}
      </div>

      {/* Right Area: Theme Toggle */}
      <div className="flex items-center justify-end z-10">
        <button 
          onClick={toggleTheme}
          className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300 ease-in-out"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-6 h-6 text-white transition-colors duration-300 ease-in-out" /> : <Moon className="w-6 h-6 text-gray-900 transition-colors duration-300 ease-in-out" />}
        </button>
      </div>
    </header>
  )
}