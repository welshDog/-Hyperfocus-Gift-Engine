import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from './ErrorBoundary';

// Mock console.error to avoid seeing the error in the test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// A component that throws an error
const ErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test Error');
  }
  return <div>No Error</div>;
};

describe('ErrorBoundary', () => {
  beforeAll(() => {
    // Suppress console.error for the test that throws
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore console.error
    console.error.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Child</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('displays error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.getByText('Reload page')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', () => {
    const onReset = jest.fn();
    
    render(
      <ErrorBoundary onReset={onReset}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    fireEvent.click(screen.getByText('Try again'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('shows error details in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Error details')).toBeInTheDocument();
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('hides error details in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText('Error details')).not.toBeInTheDocument();
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });
});
