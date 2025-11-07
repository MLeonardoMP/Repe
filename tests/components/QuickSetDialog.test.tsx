/**
 * T004: Component test for QuickSetDialog
 * Tests the quick set entry dialog component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuickSetDialog from '@/components/workout/QuickSetDialog';

describe('QuickSetDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <QuickSetDialog
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display reps input field', () => {
    render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const repsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    expect(repsInput).toBeInTheDocument();
    expect(repsInput).toHaveAttribute('type', 'number');
  });

  it('should display weight input field', () => {
    render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const weightInput = screen.getByLabelText(/weight|peso/i);
    expect(weightInput).toBeInTheDocument();
    expect(weightInput).toHaveAttribute('type', 'number');
  });

  it('should allow entering reps value', () => {
    render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const repsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    fireEvent.change(repsInput, { target: { value: '10' } });

    expect(repsInput).toHaveValue(10);
  });

  it('should allow entering weight value', () => {
    render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const weightInput = screen.getByLabelText(/weight|peso/i);
    fireEvent.change(weightInput, { target: { value: '80' } });

    expect(weightInput).toHaveValue(80);
  });

  it('should call onConfirm with reps only when weight is empty', () => {
    render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const repsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    fireEvent.change(repsInput, { target: { value: '10' } });

    const confirmButton = screen.getByRole('button', { name: /confirm|add|agregar/i });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith(10, undefined);
  });

  it('should call onConfirm with both reps and weight', () => {
    render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const repsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    const weightInput = screen.getByLabelText(/weight|peso/i);

    fireEvent.change(repsInput, { target: { value: '10' } });
    fireEvent.change(weightInput, { target: { value: '80' } });

    const confirmButton = screen.getByRole('button', { name: /confirm|add|agregar/i });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith(10, 80);
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel|cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should validate that reps is greater than 0', async () => {
    render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const repsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    fireEvent.change(repsInput, { target: { value: '0' } });

    const confirmButton = screen.getByRole('button', { name: /confirm|add|agregar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    expect(screen.getByText(/must be greater|debe ser mayor/i)).toBeInTheDocument();
  });

  it('should validate that weight is greater than 0 if provided', async () => {
    render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const repsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    const weightInput = screen.getByLabelText(/weight|peso/i);

    fireEvent.change(repsInput, { target: { value: '10' } });
    fireEvent.change(weightInput, { target: { value: '0' } });

    const confirmButton = screen.getByRole('button', { name: /confirm|add|agregar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    expect(screen.getByText(/must be greater|debe ser mayor/i)).toBeInTheDocument();
  });

  it('should require reps field to submit', async () => {
    render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm|add|agregar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  it('should reset form when dialog closes', async () => {
    const { rerender } = render(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const repsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    const weightInput = screen.getByLabelText(/weight|peso/i);

    fireEvent.change(repsInput, { target: { value: '10' } });
    fireEvent.change(weightInput, { target: { value: '80' } });

    // Close and reopen
    rerender(
      <QuickSetDialog
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    rerender(
      <QuickSetDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const newRepsInput = screen.getByLabelText(/reps|repetitions|repeticiones/i);
    const newWeightInput = screen.getByLabelText(/weight|peso/i);

    expect(newRepsInput).toHaveValue(null);
    expect(newWeightInput).toHaveValue(null);
  });
});
