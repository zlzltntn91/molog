import { LayoutDashboard, Wallet, PieChart, Settings } from 'lucide-react'

export default function MainPage() {
  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">반가워요! 👋</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          오늘의 자산 현황을 확인해보세요.
        </p>
      </div>

      {/* Main Card */}
      <div className="p-6 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-blue-100 text-xs mb-1">총 자산</p>
                <h3 className="text-2xl font-bold">₩ 42,500,000</h3>
            </div>
            <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                +12.5%
            </span>
        </div>
        <div className="h-1 bg-blue-500 rounded-full overflow-hidden">
            <div className="h-full w-[70%] bg-white/90 rounded-full"></div>
        </div>
        <p className="text-right text-xs text-blue-100 mt-2">지난달 대비 250만원 증가</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-sm border border-gray-100 dark:border-transparent flex flex-col items-start gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">이번 달 수입</span>
            <span className="font-bold text-lg">345만</span>
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-sm border border-gray-100 dark:border-transparent flex flex-col items-start gap-3">
           <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <PieChart className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">이번 달 지출</span>
            <span className="font-bold text-lg">120만</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-5 bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-sm border border-gray-100 dark:border-transparent">
         <h3 className="text-sm font-bold mb-4">빠른 메뉴</h3>
         <div className="flex justify-between px-2">
            <button className="flex flex-col items-center gap-2 group w-16">
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 ">
                <LayoutDashboard className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">요약</span>
            </button>
            <button className="flex flex-col items-center gap-2 group w-16">
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 ">
                <PieChart className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">분석</span>
            </button>
            <button className="flex flex-col items-center gap-2 group w-16">
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 ">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">설정</span>
            </button>
         </div>
      </div>
    </div>
  )
}