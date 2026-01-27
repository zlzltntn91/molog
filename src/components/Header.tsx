import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Moon, Sun } from 'lucide-react'

interface HeaderProps {
  isDarkMode: boolean
  toggleTheme: () => void
}

export default function Header({ isDarkMode, toggleTheme }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isHomePage = location.pathname === '/'
  const isMainPage = location.pathname === '/main'
  const isLedgerDayView = location.pathname === '/ledger' && searchParams.get('view') === 'day'

  const showBackButton = !isHomePage && !isMainPage

  const handleBack = (e: React.MouseEvent) => {
    if (isLedgerDayView) {
      e.preventDefault()
      navigate('/ledger?view=month')
    }
    // 기본 동작은 Link의 to={-1}이 처리하도록 함
  }

  return (
    <header className="flex-none h-14 box-content pt-[env(safe-area-inset-top)] bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md flex items-center px-4 z-50 sticky top-0 border-b border-theme justify-between">
      {/* Left Area: Back Button or Title */}
      <div className="flex items-center justify-start z-10">
        {isMainPage ? (
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Molog</span>
        ) : showBackButton ? (
          <Link 
            to={isLedgerDayView ? "/ledger?view=month" : (-1 as any)}
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white"
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
          className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-6 h-6 text-white" />
          ) : (
            <Moon className="w-6 h-6 text-gray-900" />
          )}
        </button>
      </div>
    </header>
  )
}