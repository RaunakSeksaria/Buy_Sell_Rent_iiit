"use client"; // This directive tells Next.js that this component uses client-side features

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Get URL search parameters
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const errorMsg = searchParams.get('error');

    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      setSuccess('Login successful!');
      
      // Clean URL and redirect to profile
      window.history.replaceState({}, document.title, '/login');
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    }

    if (errorMsg) {
      setError(errorMsg);
      // Clean URL
      window.history.replaceState({}, document.title, '/login');
    }
  }, [router]); // Add router as dependency



  const handleCASLogin = () => {
    // Redirect to the CAS login endpoint
    window.location.href = 'http://localhost:5000/cas';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const iiitEmailPattern = /^[a-zA-Z0-9._%+-]+@(students\.|research\.)?iiit\.ac\.in$/;

    if (!iiitEmailPattern.test(email)) {
      setError('Please use your IIIT email address.');
      return;
    }

    // Clear previous error
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Something went wrong');
        return;
      }

      const data = await response.json();
      console.log('Login successful:', data);
      setSuccess('Login successful!');

      // Store the JWT token in localStorage
      localStorage.setItem('token', data.token);

      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 1000);

      // Reset form fields (optional)
      setEmail('');
      setPassword('');
    } catch (error) {
      setError('Failed to log in. Please try again later.');
      console.error('Error logging in:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-80">
          <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">{success}</div>}
          {/* Add CAS Login Button */}
          <button
            onClick={handleCASLogin}
            className="w-full py-2 mb-4 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-blue)] transition-colors"
          >
            Login with IIIT CAS
          </button>
          
          <div className="text-center mb-4">
            <span className="text-[var(--dracula-comment)]">- OR -</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                placeholder="Enter your IIIT email"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-white bg-[var(--dracula-purple)] rounded-r hover:bg-[var(--dracula-pink)] transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;