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

const updateCartItemQuantity = async (itemId: string, quantity: number, setCartItems: React.Dispatch<React.SetStateAction<any[]>>, setError: React.Dispatch<React.SetStateAction<string | null>>) => {
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
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update item quantity');
    }

    const data = await res.json();
    console.log('Item quantity updated successfully:', data);

    // Update the cart items state
    setCartItems(prevItems => prevItems.map(item => 
      item.item._id === itemId ? { ...item, quantity } : item
    ));
    setError(null); // Clear any previous error
  } catch (error) {
    console.error('Error updating item quantity:', error);
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unknown error occurred');
    }
  }
};

const removeCartItem = async (itemId: string, setCartItems: React.Dispatch<React.SetStateAction<any[]>>, setError: React.Dispatch<React.SetStateAction<string | null>>) => {
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
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to remove item from cart');
    }

    const data = await res.json();
    console.log('Item removed from cart successfully:', data);

    // Update the cart items state
    setCartItems(prevItems => prevItems.filter(item => item.item._id !== itemId));
    setError(null); // Clear any previous error
  } catch (error) {
    console.error('Error removing item from cart:', error);
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unknown error occurred');
    }
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

  const calculateTotalCost = () => {
    return cartItems.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0);
  };

  if (loading) {
    return <div>Loading...</div>;
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
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          {cartItems.length > 0 ? (
            <>
              <ul>
                {cartItems.map((cartItem) => (
                  <li key={cartItem.item._id} className="mb-4">
                    <div className="bg-[var(--dracula-selection)] p-4 rounded flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-bold">{cartItem.item.itemName}</h2>
                        <p className="text-sm text-[var(--dracula-comment)]">Rs.{cartItem.item.price} per unit</p>
                        <div className="flex items-center mt-2">
                          <input
                            type="number"
                            value={cartItem.quantity}
                            onChange={(e) => updateCartItemQuantity(cartItem.item._id, parseInt(e.target.value), setCartItems, setError)}
                            className="w-16 px-2 py-1 rounded bg-[var(--dracula-foreground)] text-black mr-2"
                          />
                          <button
                            onClick={() => removeCartItem(cartItem.item._id, setCartItems, setError)}
                            className="py-1 px-2 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-bold">Rs.{cartItem.item.price * cartItem.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-4">
                <p className="text-lg font-bold">Total Cost: Rs.{calculateTotalCost()}</p>
              </div>
            </>
          ) : (
            <p className="text-center text-[var(--dracula-comment)]">Your cart is empty</p>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(CartPage);