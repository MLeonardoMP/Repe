/**
 * ConfirmDialog Component Unit Tests
 * Tests for confirmation dialog with customizable actions
 * Updated to match current component API
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

describe('ConfirmDialog Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show confirm and cancel buttons', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete Workout"
        description="This action cannot be undone"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  it('should handle confirm button click', async () => {
    const user = userEvent.setup();
    
    render(
      <ConfirmDialog
        open={true}
        title="Confirm"
        description="Continue?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should handle cancel button click', async () => {
    const user = userEvent.setup();
    
    render(
      <ConfirmDialog
        open={true}
        title="Confirm"
        description="Continue?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should show custom button labels', () => {
    render(
      <ConfirmDialog
        open={true}
        title="End Workout"
        description="Save progress?"
        confirmText="Save & Exit"
        cancelText="Discard"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Save & Exit')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
  });

  it('should handle backdrop click', async () => {
    const user = userEvent.setup();
    
    render(
      <ConfirmDialog
        open={true}
        title="Confirm"
        description="Continue?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const backdrop = screen.getByTestId('dialog-backdrop');
    await user.click(backdrop);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should display title and description correctly', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete Workout"
        description="This will permanently remove the workout session."
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Delete Workout');
    expect(screen.getByTestId('dialog-description')).toHaveTextContent('This will permanently remove the workout session.');
  });

  it('should maintain accessibility standards', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Accessible Dialog"
        description="This is accessible"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should apply custom className', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Custom Class"
        description="Testing custom class"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        className="custom-dialog-class"
      />
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('custom-dialog-class');
  });
});
