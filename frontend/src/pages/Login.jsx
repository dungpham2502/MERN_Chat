// src/Login.js
import React from 'react';
import { useState } from 'react';
import { useUser } from '../context/userContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { setUser } = useUser();

    const navigateToHomepage = () => {
        navigate('/')
    }

    const loginUser = async ( email, password) => {
        try {
        const response = await fetch("http://localhost:3000/api/user/login", {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
            setError(data.error); 
        } else {
            setUser(data);
            setError(""); 
            navigateToHomepage();
        }
        } catch (err) {
        console.error("Signup error:", err);
        setError("Failed to sign up."); 
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        await loginUser(email, password);
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-lg">
            {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
            )}
            <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">
                Or <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">create a new account</a>
            </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input 
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address"
                    onChange={(e)=>{setEmail(e.target.value)}}
                    value={email}
                />
                </div>
                <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    autoComplete="current-password" 
                    required 
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" 
                    onChange={(e)=>{setPassword(e.target.value)}}
                    value={password}
                />
                </div>
            </div>

            <div>
                <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign In
                </button>
            </div>
            </form>
        </div>
        </div>
    );
};

export default Login;
