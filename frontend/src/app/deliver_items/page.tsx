"use client";

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import withAuth from '@/components/withAuth';

const fetchPendingOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      // First get the user profile to get userId
      const userRes = await fetch('http://localhost:5000/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userRes.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await userRes.json();
      const userId = userData._id;
      console.log(userId);
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        throw new Error('Failed to fetch pending orders');
      }
  
      const data = await res.json();
      console.log('All orders:', data);
  
      // Filter only pending orders where current user is the seller
      const filteredOrders = data.filter((order: any) => {
        console.log('Checking order:', {
          orderId: order._id,
          status: order.status,
          sellerId: order.seller._id,
          matches: order.status === 'pending' && order.seller._id === userId
        });
        return order.status === 'pending' && order.seller._id === userId;
      });
  
      console.log('Filtered orders:', filteredOrders);
      return filteredOrders;
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      throw error;
    }
  };

const DeliverItemsPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otpInputs, setOtpInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setLoading(true);
    fetchPendingOrders()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
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

      // Refresh orders after successful verification
      const updatedOrders = await fetchPendingOrders();
      setOrders(updatedOrders);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify OTP');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Deliver Items - Pending Orders</title>
      </Head>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="bg-[var(--dracula-current-line)] p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <h1 className="text-2xl font-bold text-center mb-4">Pending Deliveries</h1>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          
          {orders.length === 0 ? (
            <p className="text-center">No pending deliveries</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-[var(--dracula-selection)] p-4 rounded">
                  <h2 className="text-lg font-bold">Order ID: {order.transactionId}</h2>
                  <p className="text-[var(--dracula-comment)]">
                    Buyer: {order.buyer.firstName} {order.buyer.lastName}
                  </p>
                  <p className="text-[var(--dracula-comment)]">
                    Email: {order.buyer.email}
                  </p>
                  <div className="mt-2">
                    <h3 className="font-bold">Items:</h3>
                    <ul className="list-disc pl-5">
                      {order.items.map((item: any) => (
                        <li key={`${order._id}-${item.item._id}`}>
                          {item.item.itemName} - Quantity: {item.quantity} - Rs.{item.item.price * item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otpInputs[order._id] || ''}
                      onChange={(e) => setOtpInputs(prev => ({ ...prev, [order._id]: e.target.value }))}
                      className="px-3 py-1 rounded bg-[var(--dracula-foreground)] text-black"
                    />
                    <button
                      onClick={() => handleVerifyOTP(order._id)}
                      className="py-1 px-3 bg-[var(--dracula-purple)] text-white rounded hover:bg-[var(--dracula-pink)] transition-colors"
                    >
                      Complete Delivery
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(DeliverItemsPage);