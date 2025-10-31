import * as React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={[
        'flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-400',
        className
      ].join(' ')}
      {...props}
    />
  )
);
Input.displayName = 'Input';

