"use client"; // This directive tells Next.js that this component uses client-side features

import React, { useState } from 'react';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    contactNumber: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Example client-side validation for IIIT email : students, research, and just iiit are the only domains allowed so far
    const iiitEmailPattern = /^[a-zA-Z0-9._%+-]+@(students\.|research\.)?iiit\.ac\.in$/;
    if (!iiitEmailPattern.test(formData.email)) {
      setError('Please use your IIIT email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Clear previous error
    setError('');

    // Placeholder for form submission logic
    console.log('Signing up with:', formData);

    // Reset form fields (optional)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      age: '',
      contactNumber: '',
      password: '',
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-4">Sign Up</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="firstName">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="lastName">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
              placeholder="Enter your IIIT email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="age">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="contactNumber">
              Contact Number
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
