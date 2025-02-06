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
  const router = useRouter();

  useEffect(() => {
    // Fetch profile data from the backend
    const fetchProfileData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-80">
        <h1 className="text-2xl font-bold text-center mb-4">Profile</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
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
      </div>
    </div>
  );
};

export default ProfilePage;