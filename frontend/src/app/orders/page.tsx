"use client";

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import withAuth from '@/components/withAuth';

const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('token'); // Get token from localStorage
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Send token in Authorization header
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

const verifyOTP = async (orderId: string, otp: string) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/orders/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId, otp }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to verify OTP');
    }

    return await res.json();
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

const regenerateOTP = async (orderId: string) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/orders/regenerate-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to regenerate OTP');
    }

    return await res.json();
  } catch (error) {
    console.error('Error regenerating OTP:', error);
    throw error;
  }
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [otpInputs, setOtpInputs] = useState<{ [key: string]: string }>({});
  const [regenerating, setRegenerating] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setLoading(true);
    fetchOrders()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleVerifyOTP = async (orderId: string) => {
    try {
      const otp = otpInputs[orderId];
      if (!otp) {
        setError('Please enter OTP');
        return;
      }

      await verifyOTP(orderId, otp);
      // Refresh orders after successful verification
      const updatedOrders = await fetchOrders();
      setOrders(updatedOrders);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify OTP');
    }
  };

  const handleRegenerateOTP = async (orderId: string) => {
    try {
      setRegenerating(prev => ({ ...prev, [orderId]: true }));
      const result = await regenerateOTP(orderId);
      setError(null);
      const updatedOrders = await fetchOrders();
      setOrders(updatedOrders);
      alert(`Your new OTP is: ${result.otp}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to regenerate OTP');
    } finally {
      setRegenerating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const renderOrders = (filterFn: (order: any) => boolean) => {
    return orders.filter(filterFn).map((order) => (
      <div key={order._id} className="bg-[var(--dracula-selection)] p-4 rounded mb-4">
        <h2 className="text-lg font-bold">Order ID: {order.transactionId}</h2>
        <p>Amount: Rs.{order.amount}</p>
        <p>Status: {order.status}</p>
        <div>
          <h3 className="font-bold">Items:</h3>
          <ul>
            {order.items.map((item: any) => (
              <li key={`${order._id}-${item.item._id}`}>
                {item.item.itemName} - Quantity: {item.quantity}
              </li>
            ))}
          </ul>
        </div>
        {order.status === 'pending' && order.buyer._id === localStorage.getItem('userId') && (
          <div className="mt-2">
            <button
              onClick={() => handleRegenerateOTP(order._id)}
              disabled={regenerating[order._id]}
              className={`mt-2 py-1 px-2 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors ${regenerating[order._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {regenerating[order._id] ? 'Regenerating...' : 'Regenerate OTP'}
            </button>
          </div>
        )}
        {order.status === 'pending' && order.seller._id === localStorage.getItem('userId') && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otpInputs[order._id] || ''}
              onChange={(e) => setOtpInputs(prev => ({ ...prev, [order._id]: e.target.value }))}
              className="px-2 py-1 rounded bg-[var(--dracula-foreground)] text-black mr-2"
            />
            <button
              onClick={() => handleVerifyOTP(order._id)}
              className="py-1 px-2 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
            >
              Verify & Complete Order
            </button>
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Orders - Your Order History</title>
      </Head>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <h1 className="text-2xl font-bold text-center mb-4">Your Orders</h1>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-4 ${activeTab === 'pending' ? 'bg-[var(--dracula-purple)] text-white' : 'bg-[var(--dracula-foreground)] text-black'} rounded-l`}
            >
              Pending Orders
            </button>
            <button
              onClick={() => setActiveTab('bought')}
              className={`py-2 px-4 ${activeTab === 'bought' ? 'bg-[var(--dracula-purple)] text-white' : 'bg-[var(--dracula-foreground)] text-black'}`}
            >
              Bought Items
            </button>
            <button
              onClick={() => setActiveTab('sold')}
              className={`py-2 px-4 ${activeTab === 'sold' ? 'bg-[var(--dracula-purple)] text-white' : 'bg-[var(--dracula-foreground)] text-black'} rounded-r`}
            >
              Sold Items
            </button>
          </div>
          {activeTab === 'pending' && renderOrders((order) => order.status === 'pending')}
          {activeTab === 'bought' && renderOrders((order) => order.status === 'completed' && order.buyer._id === localStorage.getItem('userId'))}
          {activeTab === 'sold' && renderOrders((order) => order.status === 'completed' && order.seller._id === localStorage.getItem('userId'))}
        </div>
      </div>
    </>
  );
};

export default withAuth(OrdersPage);