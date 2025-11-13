import React from 'react';
import './LoadingSpinner.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  fullScreen = false,
}) => {
  const sizeClass = `spinner-${size}`;
  const classes = ['spinner-container', sizeClass, className]
    .filter(Boolean)
    .join(' ');

  const spinner = (
    <div className={classes}>
      <div className="spinner" aria-label="Loading">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

