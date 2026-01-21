import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Check } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { SiNaver } from 'react-icons/si'
import FormInput from '../components/FormInput'

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(true)
  const navigate = useNavigate()

  const handleLogin = () => {
    // 임시로 바로 메인 페이지로 이동
    navigate('/main')
  }

  return (
    <>
    <div className="w-full flex flex-col items-center">
      {/* Logo/Title */}
      <h1 className="text-5xl font-bold mb-4 text-center">Molog</h1>
      
      {/* Subtitle */}
      <p className="text-sm mb-8 text-gray-500 dark:text-gray-400 text-center">
        아직 회원이 아니신가요?{' '}
        <Link to="/signup" className="underline text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          회원가입
        </Link>
      </p>
    </div>

      {/* Input Group */}
      <div className="w-full rounded-xl overflow-hidden mb-4 bg-white dark:bg-[#2c2c2e] border border-gray-200 dark:border-transparent shadow-sm">
        <FormInput 
          icon={Mail} 
          type="text" 
          placeholder="아이디" 
          containerClassName="border-b border-gray-100 dark:border-white/10"
        />
        <FormInput 
          icon={Lock} 
          type="password" 
          placeholder="비밀번호" 
          containerClassName="border-none"
        />
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="w-full flex justify-between items-center mb-6 text-sm">
        <label className="flex items-center cursor-pointer select-none">
          <div 
            className={`w-5 h-5 rounded border flex items-center justify-center mr-2 transition-colors ${
              rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 dark:bg-transparent dark:border-gray-500'
            }`}
            onClick={() => setRememberMe(!rememberMe)}
          >
            {rememberMe && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </div>
          <span className="text-gray-500 dark:text-gray-400">Remember me</span>
        </label>
        <Link to="/find-id" className="underline text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          비밀번호를 잊으셨나요?
        </Link>
      </div>

      {/* Login Button */}
      <button 
        onClick={handleLogin}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-base transition-colors mb-6 shadow-lg shadow-blue-600/30"
      >
        로그인
      </button>

      {/* Divider */}
      <div className="text-sm mb-6 flex items-center w-full text-gray-400">
        <div className="flex-grow h-px bg-gray-300/30"></div>
        <span className="px-3">또는</span>
        <div className="flex-grow h-px bg-gray-300/30"></div>
      </div>

      {/* Social Login Buttons */}
      <div className="w-full space-y-3">
        {/* Google */}
        <button 
          onClick={handleLogin}
          className="w-full font-medium py-3.5 rounded-xl text-base transition-colors flex items-center justify-center relative bg-white hover:bg-gray-50 text-black border border-gray-200 shadow-sm dark:border-transparent dark:hover:bg-gray-100"
        >
          <FcGoogle className="w-5 h-5 absolute left-4" />
          <span>구글 계정으로 로그인</span>
        </button>
        
        {/* Kakao */}
        <button 
          onClick={handleLogin}
          className="w-full bg-[#FEE500] hover:bg-[#FDD800] text-[#3c1e1e] font-medium py-3.5 rounded-xl text-base transition-colors flex items-center justify-center relative shadow-sm"
        >
          <RiKakaoTalkFill className="w-6 h-6 absolute left-4" />
          <span>카카오톡으로 로그인</span>
        </button>

        {/* Naver */}
        <button 
          onClick={handleLogin}
          className="w-full bg-[#03C75A] hover:bg-[#02b351] text-white font-medium py-3.5 rounded-xl text-base transition-colors flex items-center justify-center relative shadow-sm"
        >
          <SiNaver className="w-4 h-4 absolute left-4" />
          <span>네이버 아이디로 로그인</span>
        </button>
      </div>
    </>
  )
}