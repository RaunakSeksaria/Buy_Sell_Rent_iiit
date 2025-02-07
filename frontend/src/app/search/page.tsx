"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import withAuth from '@/components/withAuth';

interface SearchFilters {
  query: string;
  categories: string[];
  minPrice: string;
  maxPrice: string;
  minQuantity: string;
  maxQuantity: string;
}

const categories = [
  'Consumables',
  'Electronics',
  'Accessory',
  'Clothes',
  'Stationery',
  'Other'
];

const SearchPage: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categories: [],
    minPrice: '',
    maxPrice: '',
    minQuantity: '',
    maxQuantity: ''
  });
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (searchParams = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/items/search${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setResults(data.items);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (filters.query) params.append('q', filters.query);
    if (filters.categories.length > 0) {
      params.append('categories', filters.categories.join(','));
    }
    if (filters.minPrice && !isNaN(Number(filters.minPrice)) && Number(filters.minPrice) >= 0) {
      params.append('minPrice', filters.minPrice);
    }
    if (filters.maxPrice && !isNaN(Number(filters.maxPrice)) && Number(filters.maxPrice) >= 0) {
      params.append('maxPrice', filters.maxPrice);
    }
    if (filters.minQuantity && !isNaN(Number(filters.minQuantity)) && Number(filters.minQuantity) >= 0) {
      params.append('minQuantity', filters.minQuantity);
    }
    if (filters.maxQuantity && !isNaN(Number(filters.maxQuantity)) && Number(filters.maxQuantity) >= 0) {
      params.append('maxQuantity', filters.maxQuantity);
    }
    
    const searchParams = params.toString() ? `?${params.toString()}` : '';
    fetchItems(searchParams);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategories = Array.from(e.target.selectedOptions, option => option.value);
    setFilters({ ...filters, categories: selectedCategories });
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold text-center mb-4">Search Items</h1>
          <form onSubmit={handleSearch}>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="query">
                Search Query
              </label>
              <input
                type="text"
                id="query"
                value={filters.query}
                onChange={(e) => setFilters({...filters, query: e.target.value})}
                className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="categories">
                Categories
              </label>
              <select
                id="categories"
                multiple
                value={filters.categories}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="minPrice">
                  Min Price
                </label>
                <input
                  type="number"
                  id="minPrice"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                />
              </div>
              <div>
                <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="maxPrice">
                  Max Price
                </label>
                <input
                  type="number"
                  id="maxPrice"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="minQuantity">
                  Min Quantity
                </label>
                <input
                  type="number"
                  id="minQuantity"
                  value={filters.minQuantity}
                  onChange={(e) => setFilters({...filters, minQuantity: e.target.value})}
                  className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                />
              </div>
              <div>
                <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="maxQuantity">
                  Max Quantity
                </label>
                <input
                  type="number"
                  id="maxQuantity"
                  value={filters.maxQuantity}
                  onChange={(e) => setFilters({...filters, maxQuantity: e.target.value})}
                  className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
            >
              Search
            </button>
          </form>

          <div className="mt-4">
            {results.length > 0 ? (
              <ul>
                {results.map((item) => (
                  <li key={item._id} className="mb-2">
                    <Link href={`/item?id=${item._id}`}>
                      <div className="bg-[var(--dracula-selection)] p-2 rounded cursor-pointer">
                        <h2 className="text-lg font-bold">{item.itemName}</h2>
                        <p>{item.description}</p>
                        <p className="text-sm text-[var(--dracula-comment)]">Rs.{item.price}</p>
                        <p className="text-sm text-[var(--dracula-comment)]">Category: {item.category}</p>
                        <p className="text-sm text-[var(--dracula-comment)]">Quantity: {item.quantity}</p>
                        <p className="text-sm text-[var(--dracula-comment)]">Seller: {item.userId.firstName} {item.userId.lastName}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--dracula-comment)]">No results found</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(SearchPage);