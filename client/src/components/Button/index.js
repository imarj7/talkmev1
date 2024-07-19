import React from 'react'

const Button = ({
    label = 'Button',
    type = 'button',
    className = '',
    disabled = false,
    onClick,
}) => {
  return (
    <button 
  type={type} 
  className={`text-white bg-black transition-transform ease-in-out duration-75ms hover:bg-[#2b9348] hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${className}`} 
  onClick={onClick} 
  disabled={disabled}>
  {label}
</button>

  )
}

export default Button