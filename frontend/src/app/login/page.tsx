"use client"; // This directive tells Next.js that this component uses client-side features

import React, { useState } from 'react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const iiitEmailPattern = /^[a-zA-Z0-9._%+-]+@(students\.|research\.)?iiit\.ac\.in$/;

    if (!iiitEmailPattern.test(email)) {
      setError('Please use your IIIT email address.');
      return;
    }

    // Clear previous error
    setError('');

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

      // Reset form fields (optional)
      setEmail('');
      setPassword('');
    } catch (error) {
      setError('Failed to log in. Please try again later.');
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-80">
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
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
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
              placeholder="Enter your password"
              required
            />
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
  );
};

export default LoginPage;
