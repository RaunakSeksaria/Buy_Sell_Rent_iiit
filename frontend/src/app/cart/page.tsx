"use client";

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import withAuth from '@/components/withAuth';

const fetchCartItems = async () => {
  try {
    const token = localStorage.getItem('token'); // Get token from localStorage
    const res = await fetch('http://localhost:5000/api/users/cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Send token in Authorization header
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch cart items');
    }

    const data = await res.json();
    return data.itemsInCart;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  try {
    const token = localStorage.getItem('token'); // Get token from localStorage
    const res = await fetch('http://localhost:5000/api/users/cart', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Send token in Authorization header
      },
      body: JSON.stringify({ itemId, quantity }),
    });

    if (!res.ok) {
      throw new Error('Failed to update item quantity');
    }

    const data = await res.json();
    console.log('Item quantity updated successfully:', data);
    alert('Item quantity updated successfully');
  } catch (error) {
    console.error('Error updating item quantity:', error);
    alert('Error updating item quantity');
  }
};

const removeCartItem = async (itemId: string) => {
  try {
    const token = localStorage.getItem('token'); // Get token from localStorage
    const res = await fetch('http://localhost:5000/api/users/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Send token in Authorization header
      },
      body: JSON.stringify({ itemId }),
    });

    if (!res.ok) {
      throw new Error('Failed to remove item from cart');
    }

    const data = await res.json();
    console.log('Item removed from cart successfully:', data);
    alert('Item removed from cart successfully');
  } catch (error) {
    console.error('Error removing item from cart:', error);
    alert('Error removing item from cart');
  }
};

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchCartItems()
      .then((items) => {
        setCartItems(items);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching cart items:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Head>
        <title>Cart - Your Items</title>
      </Head>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold text-center mb-4">Your Cart</h1>
          {cartItems.length > 0 ? (
            <ul>
              {cartItems.map((cartItem) => (
                <li key={cartItem.item._id} className="mb-4">
                  <div className="bg-[var(--dracula-selection)] p-4 rounded">
                    <h2 className="text-lg font-bold">{cartItem.item.itemName}</h2>
                    <p>{cartItem.item.description}</p>
                    <p className="text-sm text-[var(--dracula-comment)]">Rs.{cartItem.item.price}</p>
                    <p className="text-sm text-[var(--dracula-comment)]">Category: {cartItem.item.category}</p>
                    <div className="flex items-center mt-2">
                      <input
                        type="number"
                        value={cartItem.quantity}
                        onChange={(e) => updateCartItemQuantity(cartItem.item._id, parseInt(e.target.value))}
                        className="w-16 px-2 py-1 rounded bg-[var(--dracula-foreground)] text-black mr-2"
                      />
                      <button
                        onClick={() => removeCartItem(cartItem.item._id)}
                        className="py-1 px-2 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-[var(--dracula-comment)]">Your cart is empty</p>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(CartPage);