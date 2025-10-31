import * as React from 'react';
import { Button } from '../primitives/Button';

export const Navbar = ({ title = 'CRM', right }: { title?: string; right?: React.ReactNode }) => {
  return (
    <nav className="w-full border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="font-semibold">{title}</div>
        <div className="flex items-center gap-2">
          {right}
          <Button variant="secondary">Profile</Button>
        </div>
      </div>
    </nav>
  );
};

