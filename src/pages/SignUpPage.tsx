import { Link } from 'react-router-dom'
import { Mail, Lock, User, Phone } from 'lucide-react'
import FormInput from '../components/FormInput'

export default function SignUpPage() {
  return (
    <>
    <div className="w-full text-center">
      <h1 className="text-4xl font-bold mb-2">회원가입</h1>
      <p className="text-sm mb-8 text-gray-500 dark:text-gray-400">
        Molog와 함께 시작해보세요
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
          icon={Mail} 
          type="text" 
          placeholder="아이디 (이메일)" 
          containerClassName="border-b border-gray-100 dark:border-white/10"
        />
        <FormInput 
          icon={Lock} 
          type="password" 
          placeholder="비밀번호" 
          containerClassName="border-b border-gray-100 dark:border-white/10"
        />
         <FormInput 
          icon={Lock} 
          type="password" 
          placeholder="비밀번호 확인" 
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
        가입하기
      </button>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        이미 계정이 있으신가요?{' '}
        <Link to="/" className="underline text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
          로그인
        </Link>
      </div>
    </>
  )
}