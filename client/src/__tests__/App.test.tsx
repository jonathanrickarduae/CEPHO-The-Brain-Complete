// @ts-nocheck
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock tRPC client
jest.mock('../lib/trpc', () => ({
  trpc: {
    useContext: jest.fn(() => ({
      invalidate: jest.fn(),
    })),
  },
  trpcClient: {},
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // App should render without errors
    expect(document.body).toBeInTheDocument();
  });
});
