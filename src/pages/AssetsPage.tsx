import { PiggyBank, Landmark, Plus } from 'lucide-react'

export default function AssetsPage() {
  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">내 자산</h1>
        <button className="text-sm text-blue-600 dark:text-blue-400 font-medium">편집</button>
      </div>

      {/* 총 자산 카드 */}
      <div className="p-6 bg-gray-900 dark:bg-black rounded-2xl text-white shadow-lg">
        <p className="text-gray-400 text-sm mb-1">순자산</p>
        <h2 className="text-3xl font-bold">₩ 142,500,000</h2>
        <div className="mt-6 flex gap-8">
            <div>
                <p className="text-gray-400 text-xs">총 자산</p>
                <p className="font-bold">1.85억</p>
            </div>
            <div>
                <p className="text-gray-400 text-xs">총 부채</p>
                <p className="font-bold text-red-400">-4,250만</p>
            </div>
        </div>
      </div>

      {/* 자산 그룹 */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg px-1">입출금 계좌</h3>
        <div className="bg-white dark:bg-[#2c2c2e] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                        <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium">국민은행 주거래</p>
                        <p className="text-xs text-gray-500">123-456-7890</p>
                    </div>
                </div>
                <span className="font-bold">3,450,000원</span>
            </div>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium">신한은행 월급통장</p>
                        <p className="text-xs text-gray-500">110-222-333333</p>
                    </div>
                </div>
                <span className="font-bold">1,200,000원</span>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg px-1">투자</h3>
        <div className="bg-white dark:bg-[#2c2c2e] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <PiggyBank className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-medium">한국투자증권</p>
                        <p className="text-xs text-red-500">+12.5% (250만)</p>
                    </div>
                </div>
                <span className="font-bold">24,500,000원</span>
            </div>
        </div>
      </div>

      {/* 추가 버튼 */}
      <button className="w-full py-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 ">
        <Plus className="w-5 h-5" />
        자산 추가하기
      </button>
    </div>
  )
}
