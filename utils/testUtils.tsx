import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../theme/ThemeProvider';
import { AgentProvider } from '../Agent/AgentProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AgentProvider>
          {children}
        </AgentProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data generators
export const mockData = {
  user: {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    avatar: 'https://example.com/avatar.jpg',
  },

  event: {
    eventId: '1',
    title: 'Test Event',
    description: 'This is a test event description',
    startDate: '2024-12-31T18:00:00.000Z',
    endDate: '2024-12-31T22:00:00.000Z',
    location: {
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      zipCode: '12345',
      latitude: 40.7128,
      longitude: -74.0060,
    },
    capacity: 100,
    price: 25.00,
    status: 'published',
    tags: ['music', 'party'],
    imageUrl: 'https://example.com/event.jpg',
  },

  agentMessage: {
    role: 'user' as const,
    content: 'Test message',
    timestamp: new Date().toISOString(),
  },

  suggestion: {
    type: 'tip' as const,
    text: 'Test suggestion',
    priority: 'medium' as const,
    category: 'test',
  },
};

// Test utilities
export const testUtils = {
  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock async function
  mockAsync: <T,>(data: T, delay: number = 100) => 
    jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(data), delay))
    ),

  // Mock error
  mockError: (message: string = 'Test error') => 
    jest.fn().mockRejectedValue(new Error(message)),

  // Create mock navigation
  mockNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
    dispatch: jest.fn(),
    canGoBack: jest.fn(() => true),
    isFocused: jest.fn(() => true),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }),

  // Create mock route
  mockRoute: (params: any = {}) => ({
    key: 'test-route',
    name: 'TestScreen',
    params,
  }),
};

// Custom matchers
export const customMatchers = {
  toBeValidEvent: (received: any) => {
    const requiredFields = ['eventId', 'title', 'description', 'startDate', 'location'];
    const missingFields = requiredFields.filter(field => !(field in received));
    
    if (missingFields.length > 0) {
      return {
        message: () => `Expected event to have fields: ${missingFields.join(', ')}`,
        pass: false,
      };
    }
    
    return {
      message: () => 'Event has all required fields',
      pass: true,
    };
  },

  toBeValidUser: (received: any) => {
    const requiredFields = ['id', 'username', 'email'];
    const missingFields = requiredFields.filter(field => !(field in received));
    
    if (missingFields.length > 0) {
      return {
        message: () => `Expected user to have fields: ${missingFields.join(', ')}`,
        pass: false,
      };
    }
    
    return {
      message: () => 'User has all required fields',
      pass: true,
    };
  },
};

// Setup function for tests
export const setupTest = () => {
  // Mock console methods to reduce noise in tests
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = jest.fn();
  console.warn = jest.fn();
  
  return {
    cleanup: () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    },
  };
};

// Re-export everything from testing library
export * from '@testing-library/react-native';
export { customRender as render };
