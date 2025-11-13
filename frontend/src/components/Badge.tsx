import React from 'react';
import './Badge.css';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  title?: string;
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
  style?: React.CSSProperties;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  title,
  onClick,
  style,
}) => {
  const baseClass = 'badge';
  const variantClass = `badge-${variant}`;
  const sizeClass = `badge-${size}`;
  const classes = [baseClass, variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span 
      className={classes}
      title={title}
      onClick={onClick}
      style={style}
    >
      {children}
    </span>
  );
};

export default Badge;

