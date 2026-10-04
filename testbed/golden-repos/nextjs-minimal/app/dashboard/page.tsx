import React from 'react';
import { Header } from '@/components/Header';

export default function DashboardPage() {
  return (
    <div className="dashboard">
      <Header />
      <div className="p-8">
        <h1 className="text-2xl font-bold">Workspace Overview</h1>
        <p className="text-gray-500">Monitor your AI-generated apps and active sessions.</p>
      </div>
    </div>
  );
}
