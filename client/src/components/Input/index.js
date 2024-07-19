import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Input = ({
    label = '',
    name = '',
    type = 'text',
    className = '',
    inputClassName = '',
    isRequired = true,
    placeholder = '',
    value = '',
    onChange = () => {},
    onKeyDown = () => {},
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`${className}`}>
            <label htmlFor={name} className="block text-sm font-medium text-">{label}</label>
            <div className="relative">
                <input
                    type={type === 'password' && showPassword ? 'text' : type}
                    id={name}
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${inputClassName}`}
                    placeholder={placeholder}
                    required={isRequired}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                />
                {type === 'password' && value && (
                    <button
                        type="button"
                        onClick={handleTogglePassword}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-black"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Input;
