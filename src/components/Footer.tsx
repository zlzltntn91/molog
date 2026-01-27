import { Home, PieChart, Wallet, User } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'

export default function Footer() {
  const location = useLocation()
  
  // 로그인 관련 페이지에서는 푸터를 숨김
  const hideFooterPaths = ['/', '/signup', '/find-id']
  if (hideFooterPaths.includes(location.pathname)) return null

  const isActive = (path: string) => location.pathname === path ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'

  return (
    <footer className="flex-none h-16 bg-white dark:bg-[#1c1c1e] border-t border-theme flex justify-around items-center px-2 z-50 safe-area-bottom">
      <Link to="/main" className={`flex flex-col items-center gap-1 p-2 ${isActive('/main')}`}>
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">홈</span>
      </Link>
      <Link to="/assets" className={`flex flex-col items-center gap-1 p-2 ${isActive('/assets')}`}>
        <PieChart className="w-6 h-6" />
        <span className="text-[10px] font-medium">자산</span>
      </Link>
      <Link to="/ledger" className={`flex flex-col items-center gap-1 p-2 ${isActive('/ledger')}`}>
        <Wallet className="w-6 h-6" />
        <span className="text-[10px] font-medium">가계부</span>
      </Link>
      <button className={`flex flex-col items-center gap-1 p-2 ${isActive('/my')}`}>
        <User className="w-6 h-6" />
        <span className="text-[10px] font-medium">MY</span>
      </button>
    </footer>
  )
}
