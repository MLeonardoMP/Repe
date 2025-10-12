// Simple test for validation
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MinimalSetForm from '../../src/components/workout/MinimalSetForm';

describe('MinimalSetForm - Validation Test', () => {
  it('should validate positive numbers for weight', async () => {
    const user = userEvent.setup();
    const mockOnSave = jest.fn();
    
    render(<MinimalSetForm onSave={mockOnSave} />);
    
    // Fill weight with negative value
    const weightInput = screen.getByLabelText(/weight/i);
    await user.type(weightInput, '-10');
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /save set/i });
    await user.click(saveButton);
    
    // Check for error message
    expect(screen.getByText(/weight must be positive/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});