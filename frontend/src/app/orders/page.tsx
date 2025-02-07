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

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

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

  const renderOrders = (filterFn: (order: any) => boolean) => {
    return orders.filter(filterFn).map((order) => (
      <div key={order._id} className="bg-[var(--dracula-selection)] p-4 rounded mb-4">
        <h2 className="text-lg font-bold">Order ID: {order.transactionId}</h2>
        <p>Amount: Rs.{order.amount}</p>
        <p>Status: {order.status}</p>
        <p>OTP: {order.hashedOTP}</p>
        <div>
          <h3 className="font-bold">Items:</h3>
          <ul>
            {order.items.map((item: any) => (
              <li key={item.item._id}>
                {item.item.itemName} - Quantity: {item.quantity}
              </li>
            ))}
          </ul>
        </div>
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