import React from 'react';
import { Button } from './Button';

export function Header() {
  return (
    <header className="flex justify-between items-center px-8 py-4 border-b">
      <div className="logo font-bold text-xl">Sightline App</div>
      <nav className="flex gap-6 items-center">
        <a href="/dashboard">Dashboard</a>
        <a href="/billing">Billing</a>
        <Button href="/login" variant="outline">Sign In</Button>
      </nav>
    </header>
  );
}
