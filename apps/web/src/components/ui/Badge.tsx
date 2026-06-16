import type { ReactNode } from 'react';

type BadgeVariant = 'online' | 'offline' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantClass: Record<BadgeVariant, string> = {
  online: 'badge--online',
  offline: 'badge--offline',
  neutral: 'badge--neutral',
};

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return <span className={`badge ${variantClass[variant]}`}>{children}</span>;
}
