import * as React from 'react';

export const Card = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={[
    'rounded-lg border border-neutral-200 bg-white shadow-sm',
    className
  ].join(' ')} {...props} />
);

export const CardHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={[
    'p-4 border-b border-neutral-100 flex items-center justify-between',
    className
  ].join(' ')} {...props} />
);

export const CardContent = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={[
    'p-4',
    className
  ].join(' ')} {...props} />
);

