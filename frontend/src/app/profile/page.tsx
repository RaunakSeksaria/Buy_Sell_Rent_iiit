"use client"; // This directive tells Next.js that this component uses client-side features

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    contactNumber: '',
  });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch profile data from the backend
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage
        const response = await fetch('http://localhost:5000/api/users/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Send token in Authorization header
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || 'Something went wrong');
          return;
        }

        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        setError('Failed to fetch profile data. Please try again later.');
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await fetch('http://localhost:5000/api/users/editprofile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send token in Authorization header
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Something went wrong');
        return;
      }

      const data = await response.json();
      setProfileData(data);
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile. Please try again later.');
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-80">
        <h1 className="text-2xl font-bold text-center mb-4">Profile</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="firstName">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileData.firstName}
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
                value={profileData.lastName}
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
                value={profileData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
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
                value={profileData.age}
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
                value={profileData.contactNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
            >
              Save
            </button>
          </form>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2">First Name</label>
              <div className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black">
                {profileData.firstName}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2">Last Name</label>
              <div className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black">
                {profileData.lastName}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2">Email</label>
              <div className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black">
                {profileData.email}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2">Age</label>
              <div className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black">
                {profileData.age}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2">Contact Number</label>
              <div className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black">
                {profileData.contactNumber}
              </div>
            </div>
            <button
              onClick={handleEdit}
              className="w-full py-2 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;