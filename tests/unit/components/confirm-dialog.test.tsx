/**
 * ConfirmDialog Component Unit Tests
 * Tests for confirmation dialog with customizable actions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
        message="Are you sure?"
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
        message="Are you sure?"
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
        message="This action cannot be undone"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should handle confirm button click', async () => {
    const user = userEvent.setup();
    
    render(
      <ConfirmDialog
        open={true}
        title="Confirm"
        message="Continue?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should handle cancel button click', async () => {
    const user = userEvent.setup();
    
    render(
      <ConfirmDialog
        open={true}
        title="Confirm"
        message="Continue?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should show custom button labels', () => {
    render(
      <ConfirmDialog
        open={true}
        title="End Workout"
        message="Save progress?"
        confirmLabel="Save & Exit"
        cancelLabel="Discard"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Save & Exit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Saving..."
        message="Please wait"
        isLoading={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
  });

  it('should display warning variant', () => {
    render(
      <ConfirmDialog
        open={true}
        variant="warning"
        title="Warning"
        message="This action is potentially dangerous"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByTestId('dialog-warning')).toBeInTheDocument();
  });

  it('should display danger variant', () => {
    render(
      <ConfirmDialog
        open={true}
        variant="danger"
        title="Delete Account"
        message="This will permanently delete your account"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByTestId('dialog-danger')).toBeInTheDocument();
  });

  it('should handle ESC key press', async () => {
    const user = userEvent.setup();
    
    render(
      <ConfirmDialog
        open={true}
        title="Confirm"
        message="Continue?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    await user.keyboard('{Escape}');
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should handle backdrop click', async () => {
    const user = userEvent.setup();
    
    render(
      <ConfirmDialog
        open={true}
        title="Confirm"
        message="Continue?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const backdrop = screen.getByTestId('dialog-backdrop');
    await user.click(backdrop);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should prevent backdrop dismiss when disabled', async () => {
    const user = userEvent.setup();
    
    render(
      <ConfirmDialog
        open={true}
        title="Critical Action"
        message="Cannot be cancelled"
        disableBackdropDismiss={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const backdrop = screen.getByTestId('dialog-backdrop');
    await user.click(backdrop);
    
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should show detailed description', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete Workout"
        message="Are you sure you want to delete this workout?"
        description="This will permanently remove all exercises and sets from this workout session. This action cannot be undone."
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText(/This will permanently remove all exercises/)).toBeInTheDocument();
  });

  it('should display icon when provided', () => {
    render(
      <ConfirmDialog
        open={true}
        icon="warning"
        title="Warning"
        message="Proceed with caution"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByTestId('dialog-icon-warning')).toBeInTheDocument();
  });

  it('should focus confirm button by default', async () => {
    render(
      <ConfirmDialog
        open={true}
        title="Confirm"
        message="Continue?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).toHaveFocus();
    });
  });

  it('should focus cancel button when specified', async () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete"
        message="Delete item?"
        defaultFocus="cancel"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toHaveFocus();
    });
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <ConfirmDialog
        open={true}
        title="Confirm"
        message="Continue?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    
    await user.tab();
    expect(cancelButton).toHaveFocus();
    
    await user.tab();
    expect(confirmButton).toHaveFocus();
  });

  it('should show checkbox for acknowledgment', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Terms Agreement"
        message="Do you agree to the terms?"
        requireAcknowledgment={true}
        acknowledgmentText="I understand the consequences"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('I understand the consequences')).toBeInTheDocument();
  });

  it('should disable confirm until acknowledged', async () => {
    const user = userEvent.setup();
    
    render(
      <ConfirmDialog
        open={true}
        title="Agreement"
        message="Confirm action"
        requireAcknowledgment={true}
        acknowledgmentText="I agree"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toBeDisabled();
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(confirmButton).toBeEnabled();
  });

  it('should support custom content', () => {
    const customContent = (
      <div data-testid="custom-content">
        <p>Custom dialog content</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    );
    
    render(
      <ConfirmDialog
        open={true}
        title="Custom Dialog"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      >
        {customContent}
      </ConfirmDialog>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom dialog content')).toBeInTheDocument();
  });

  it('should maintain accessibility standards', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Accessible Dialog"
        message="This is accessible"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('should handle async confirm actions', async () => {
    const user = userEvent.setup();
    const asyncConfirm = jest.fn().mockResolvedValue(undefined);
    
    render(
      <ConfirmDialog
        open={true}
        title="Save Changes"
        message="Save workout?"
        onConfirm={asyncConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);
    
    expect(asyncConfirm).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
    });
  });
});