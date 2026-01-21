import type { LucideIcon } from 'lucide-react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  containerClassName?: string
}

export default function FormInput({ icon: Icon, containerClassName = '', className = '', ...props }: FormInputProps) {
  return (
    <div className={`flex items-center px-4 py-3 bg-white dark:bg-[#2c2c2e] transition-colors ${containerClassName}`}>
      {Icon && <Icon className="text-blue-500 w-5 h-5 mr-3 flex-shrink-0" />}
      <input 
        className={`w-full text-black dark:text-white placeholder-gray-400 outline-none text-base bg-transparent ${className}`}
        {...props}
      />
    </div>
  )
}
