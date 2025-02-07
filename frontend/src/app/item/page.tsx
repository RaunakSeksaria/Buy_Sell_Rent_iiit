"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import withAuth from '@/components/withAuth';

const fetchItemData = async (id: string) => {
  try {
    console.log(`Fetching item data for ID: ${id}`);
    const res = await fetch(`http://localhost:5000/api/items/${id}`);
    if (res.status === 404) {
      console.log('Item not found');
      return null;
    }
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await res.json();
    console.log('Data fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const addToCart = async (itemId: string, quantity: number) => {
  try {
    const token = localStorage.getItem('token'); // Get token from localStorage
    const res = await fetch('http://localhost:5000/api/users/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Send token in Authorization header
      },
      body: JSON.stringify({ itemId, quantity }),
    });

    if (!res.ok) {
      throw new Error('Failed to add item to cart');
    }

    const data = await res.json();
    console.log('Item added to cart successfully:', data);
    alert('Item added to cart successfully');
  } catch (error) {
    console.error('Error adding item to cart:', error);
    alert('Error adding item to cart');
  }
};

const ItemPage: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // Gets the id from URL like /item?id=123
  console.log(id);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      console.log('Fetching item data...');
      fetchItemData(id)
        .then((data) => {
          if (data === null) {
            setError('Item not found');
          } else {
            setItem(data);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching item:', error);
          setError(error.message);
          setLoading(false);
        });
    } else {
      console.log('ID is null');
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!item) {
    return <div>Item not found</div>;
  }

  console.log("Item log");
  console.log(item.item.itemName);
  return (
    <>
      <Head>
        <title>{item.item.itemName} - Item Details</title>
      </Head>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-80">
          <h1 className="text-2xl font-bold text-center mb-4">{item.item.itemName}</h1>
          <p>{item.item.description}</p>
          <p className="text-sm text-[var(--dracula-comment)]">Rs.{item.item.price}</p>
          <p className="text-sm text-[var(--dracula-comment)]">Category: {item.item.category}</p>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => addToCart(item.item._id, 1)}
              className="py-2 px-4 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={() => window.history.back()}
              className="py-2 px-4 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(ItemPage);