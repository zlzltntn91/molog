import { Link } from 'react-router-dom'
import { User, Phone } from 'lucide-react'
import FormInput from '../components/FormInput'

export default function FindIdPage() {
  return (
    <>
    <div className="w-full text-center">
      <h1 className="text-4xl font-bold mb-2">아이디 찾기</h1>
      <p className="text-sm mb-8 text-gray-500 dark:text-gray-400">
        가입 시 등록한 정보를 입력해주세요
      </p>
    </div>

      <div className="w-full rounded-xl overflow-hidden mb-6 bg-white dark:bg-[#2c2c2e] border border-gray-200 dark:border-transparent shadow-sm">
        <FormInput 
          icon={User} 
          type="text" 
          placeholder="이름" 
          containerClassName="border-b border-gray-100 dark:border-white/10"
        />
        <FormInput 
          icon={Phone} 
          type="tel" 
          placeholder="전화번호" 
          inputMode="tel"
          containerClassName="border-none"
        />
      </div>

      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-base  mb-4 shadow-lg shadow-blue-600/30">
        아이디 찾기
      </button>

       <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        <Link to="/" className="underline text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          로그인으로 돌아가기
        </Link>
      </div>
    </>
  )
}