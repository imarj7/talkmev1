import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import img from '../../assets/2.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Button from "../../components/Button";
import Input from "../../components/Input";

const Form = () => {
    const location = useLocation();
    const initialIsSignInPage = location.pathname === '/users/sign_in';
    const [isSignInPage, setIsSignInPage] = useState(initialIsSignInPage);
    const [data, setData] = useState({
        ...(isSignInPage ? {} : { fullName: '' }), 
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    
    useEffect(() => {
        setIsSignInPage(location.pathname === '/users/sign_in');
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isSignInPage ? 'http://localhost:8000/api/login' : 'http://localhost:8000/api/register';

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const resData = await res.json();
            console.log('Response data:', resData);

            if (!res.ok) {
                throw new Error(resData.message || 'An error occurred');
            }

            console.log('Token:', resData.token);

            if (resData.token) {
                localStorage.setItem('user:token', resData.token);
                localStorage.setItem('user:detail', JSON.stringify(resData.user));

                toast.success(isSignInPage ? 'Successfully signed in' : 'Successfully registered');

                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Error:', error.message);
            toast.error(`${isSignInPage ? 'Sign in' : 'Registration'} failed: Incorrect Credentials`);
        }
    };
    
    return (
        <div className="app-container">
            <div className="bg-[#00296b] h-screen flex items-center justify-center relative main-content">
                <div className={`bg-[#00509d] w-[900px] h-[600px] shadow-lg rounded-[3%] flex transition-transform duration-500 ${isSignInPage ? 'animate-slide-in-left' : 'animate-slide-in-right'}`}>
                    <div className="w-1/2 flex flex-col justify-center items-center p-10">
                        <div className="text-4xl text-white font-extrabold">Welcome {isSignInPage ? 'Back' : ''}</div>
                        <div className="text-xl font-light mb-10 text-white">{isSignInPage ? 'Sign in to get explored' : 'Sign up to get started'}</div>
                        <form className="flex flex-col items-center w-full text-white" onSubmit={handleSubmit}>
                            {!isSignInPage && (
                                <Input
                                    label="Full name"
                                    name="name"
                                    placeholder="Enter your full name"
                                    className="mb-6 w-[75%] font-semibold"
                                    value={data.fullName}
                                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                                />
                            )}
                            <Input
                                label="Email address"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                className="mb-6 w-[75%] font-semibold"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                            />
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Enter your Password"
                                className="mb-6 w-[75%] font-semibold"
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                                showPasswordToggle
                                showPassword={showPassword}
                                onTogglePassword={() => setShowPassword(!showPassword)}
                            />
                            <Button label={isSignInPage ? 'Sign in' : 'Sign up'} type="submit" className="w-[75%] mb-2 text-white" />
                        </form>
                        <div className="text-white">{isSignInPage ? "Don't have an account?" : "Already have an account?"} <span className="text-white cursor-pointer dashed" onClick={() => navigate(`/users/${isSignInPage ? 'sign_up' : 'sign_in'}`)}>{isSignInPage ? 'Sign up' : 'Sign in'}</span></div>
                    </div>
                    <div className="w-1/2">
                        <img src={img} alt="mainpage" className="w-full h-full object-cover rounded-r-[3%]" />
                    </div>
                </div>
                <ToastContainer />
            </div>
            <div className="mobile-content">
                <div className="bg-[#00296b] h-screen flex items-center justify-center">
                    <p className="text-2xl text-white text-center animate-fade-in">Mobile version will be released soon...</p>
                </div>
            </div>
        </div>
    );
};

export default Form;
