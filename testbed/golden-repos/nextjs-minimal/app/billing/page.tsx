"use client";
import React from 'react';
import { Button } from '@/components/Button';

export default function BillingPage() {
  const handleUpgrade = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan: 'pro' }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="billing-page p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Billing & Plans</h1>
      <p className="mt-2 text-gray-600">Choose the right tier for your team.</p>
      <div className="card border p-6 rounded-lg mt-6">
        <h3 className="text-xl font-semibold">Pro Plan ($29/mo)</h3>
        <Button onClick={handleUpgrade} className="mt-4">Upgrade Now</Button>
      </div>
    </div>
  );
}
