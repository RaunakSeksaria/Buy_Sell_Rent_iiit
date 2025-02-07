"use client"; // This directive tells Next.js that this component uses client-side features

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import withAuth from '@/components/withAuth';

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    contactNumber: '',
  });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || 'Something went wrong');
          return;
        }

        const data = await response.json();
        console.log(response);
        setProfileData(data);
      } catch (error) {
        setError('Failed to fetch profile data. Please try again later.');
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
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

    // Example client-side validation for IIIT email
    const iiitEmailPattern = /^[a-zA-Z0-9._%+-]+@(students\.|research\.)?iiit\.ac\.in$/;
    if (!iiitEmailPattern.test(profileData.email)) {
      setError('Please use your IIIT email address.');
      return;
    }

    // Validation for phone number (integer-based with optional + at the start)
    const phonePattern = /^\+?[0-9]+$/;
    if (!phonePattern.test(profileData.contactNumber)) {
      setError('Please enter a valid contact number.');
      return;
    }

    // Validation for age (non-negative integer)
    const age = parseInt(profileData.age, 10);
    if (isNaN(age) || age < 0) {
      setError('Please enter a valid non-negative age.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    // Format name fields (first letter capital, others small)
    const formatName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    profileData.firstName = formatName(profileData.firstName);
    profileData.lastName = formatName(profileData.lastName);

    // Clear previous error
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await fetch('http://localhost:5000/api/users/editprofile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send token in Authorization header
        },
        body: JSON.stringify({ ...profileData, oldPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Something went wrong');
        return;
      }

      const data = await response.json();
      setProfileData(data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      setError('Failed to update profile. Please try again later.');
      console.error('Error updating profile:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-80">
          <h1 className="text-2xl font-bold text-center mb-4">Profile</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">{success}</div>}
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
              <div className="mb-4">
                <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="oldPassword">
                  Old Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    id="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                    placeholder="Enter your old password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-white bg-[var(--dracula-purple)] rounded-r hover:bg-[var(--dracula-pink)] transition-colors"
                  >
                    {showOldPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-white bg-[var(--dracula-purple)] rounded-r hover:bg-[var(--dracula-pink)] transition-colors"
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
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
    </>
  );
};

export default withAuth(ProfilePage);