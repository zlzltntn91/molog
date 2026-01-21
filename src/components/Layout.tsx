import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const location = useLocation()

  // Sync theme with the 'dark' class on the html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // 로그인, 회원가입, 아이디찾기 페이지는 컨텐츠를 중앙 정렬
  const isAuthPage = ['/', '/signup', '/find-id'].includes(location.pathname)
  // 가계부 페이지는 여백 최소화
  const isLedgerPage = location.pathname === '/ledger'

  return (
    <div className="h-screen h-[100dvh] w-full flex flex-col bg-gray-50 text-gray-900 dark:bg-[#1c1c1e] dark:text-white overflow-hidden transition-colors duration-300 ease-in-out">
      {/* 1. Header (Fixed Height) */}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      {/* 2. Content (Flexible Height, Scrollable) */}
      <main 
        id="main-scroll-container"
        className={`flex-1 w-full mx-auto overflow-y-auto hide-scrollbar transition-colors duration-300 ease-in-out ${
          isAuthPage 
            ? 'max-w-md px-6 flex flex-col justify-center items-center pb-20' // 인증 페이지는 좁게 유지
            : isLedgerPage 
              ? 'w-full px-0 py-0' // 가계부는 패딩 없이 꽉 채움
              : 'max-w-7xl px-4 md:px-6 py-6' // 기본 페이지는 적당히 넓게
        }`}
      >
        <Outlet />
      </main>

      {/* 3. Footer (Fixed Height) */}
      <Footer />
    </div>
  )
}