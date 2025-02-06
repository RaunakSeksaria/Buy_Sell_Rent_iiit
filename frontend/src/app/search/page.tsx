"use client"; // This directive tells Next.js that this component uses client-side features

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Fetch all items when the component mounts
    fetchItems();
  }, []);

  const fetchItems = async (searchQuery = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/items${searchQuery ? `/search?q=${searchQuery}` : ''}`, {
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
    fetchItems(query);
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-80">
          <h1 className="text-2xl font-bold text-center mb-4">Search Items</h1>
          <form onSubmit={handleSearch}>
            <div className="mb-4">
              <label className="block text-[var(--dracula-comment)] mb-2" htmlFor="query">
                Search Query
              </label>
              <input
                type="text"
                id="query"
                name="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[var(--dracula-foreground)] text-black"
              />
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
                  <li key={item.id} className="mb-2">
                    <div className="bg-[var(--dracula-selection)] p-2 rounded">
                      <h2 className="text-lg font-bold">{item.itemName}</h2>
                      <p>{item.description}</p>
                      <p className="text-sm text-[var(--dracula-comment)]">${item.price}</p>
                    </div>
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

export default SearchPage;