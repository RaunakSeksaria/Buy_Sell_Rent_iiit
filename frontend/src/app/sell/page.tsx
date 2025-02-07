"use client"; // This directive tells Next.js that this component uses client-side features

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import withAuth from '@/components/withAuth';

const categories = [
  'Consumables',
  'Electronics',
  'Accessory',
  'Clothes',
  'Stationery',
  'Other'
];

const SellPage: React.FC = () => {
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    price: '',
    category: '',
    quantity: '' // Add quantity field
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous error and success messages
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send token in Authorization header
        },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity) // Ensure quantity is a number
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Something went wrong');
        return;
      }

      const data = await response.json();
      setSuccess('Item listed for sale successfully!');
      setFormData({
        itemName: '',
        description: '',
        price: '',
        category: '',
        quantity: '' // Reset quantity field
      });
    } catch (error) {
      setError('Failed to list item for sale. Please try again later.');
      console.error('Error listing item for sale:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-80">
          <h1 className="text-2xl font-bold text-center mb-4">Sell Item</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="itemName">
                Item Name
              </label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="price">
                Price (Rs)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="quantity">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
            >
              List Item
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default withAuth(SellPage);