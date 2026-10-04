import React from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="hero p-12 text-center">
        <h1 className="text-4xl font-bold">Welcome to Sightline</h1>
        <p className="mt-4 text-gray-600">Comprehension layer for AI-built software.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Button href="/login">Get Started</Button>
          <Button href="/billing" variant="outline">View Pricing</Button>
        </div>
      </section>
    </main>
  );
}
