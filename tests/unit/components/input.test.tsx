/**
 * Input Component Unit Tests
 * Tests for input component with validation and states
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  it('should render with default props', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border', 'rounded', 'px-3', 'py-2');
  });

  it('should handle controlled value', () => {
    const handleChange = jest.fn();
    render(<Input value="test value" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test value');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    
    expect(handleChange).toHaveBeenCalledTimes(5);
  });

  it('should handle different input types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    const passwordInput = screen.getByDisplayValue('', { selector: 'input[type="password"]' });
    expect(passwordInput).toBeInTheDocument();

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('should show error state', () => {
    render(<Input error="This field is required" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should show success state', () => {
    render(<Input success />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-green-500');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should handle different sizes', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-8', 'text-sm');

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-12', 'text-lg');
  });

  it('should render with label', () => {
    render(<Input label="Email Address" />);
    
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('should render with placeholder', () => {
    render(<Input placeholder="Enter your email" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter your email');
  });

  it('should show helper text', () => {
    render(<Input helperText="This is a helper text" />);
    
    expect(screen.getByText('This is a helper text')).toBeInTheDocument();
  });

  it('should handle required validation', () => {
    render(<Input required label="Required Field" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('required');
    expect(screen.getByText('Required Field')).toBeInTheDocument();
  });

  it('should support custom className', () => {
    render(<Input className="custom-input" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('should handle focus and blur events', async () => {
    const user = userEvent.setup();
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    
    await user.click(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should handle readonly state', () => {
    render(<Input readOnly value="readonly value" />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toHaveAttribute('readonly');
    expect(input.value).toBe('readonly value');
  });

  it('should handle maxLength attribute', () => {
    render(<Input maxLength={10} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Input 
        label="Accessible Input"
        helperText="Helper text"
        error="Error message"
        aria-describedby="helper-text error-text"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});