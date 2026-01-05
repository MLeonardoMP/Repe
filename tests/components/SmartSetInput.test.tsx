import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartSetInput } from '@/components/workout/SmartSetInput';

describe('SmartSetInput', () => {
  it('permite editar reps manualmente al hacer click en el número', async () => {
    const onConfirm = jest.fn();

    render(
      <SmartSetInput
        initialReps={10}
        initialWeight={0}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );

    const repsDisplay = screen.getByTestId('reps-display');
    fireEvent.click(repsDisplay);

    const repsInput = screen.getByLabelText('Reps input');
    fireEvent.change(repsInput, { target: { value: '15' } });
    fireEvent.blur(repsInput);

    expect(screen.getByLabelText('Reps value').textContent).toBe('15');
  });

  it('permite editar peso manualmente con decimales', async () => {
    const onConfirm = jest.fn();

    render(
      <SmartSetInput
        initialReps={10}
        initialWeight={3}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );

    const weightDisplay = screen.getByTestId('weight-display');
    fireEvent.click(weightDisplay);

    const weightInput = screen.getByLabelText('Weight input');
    fireEvent.change(weightInput, { target: { value: '12.5' } });
    fireEvent.blur(weightInput);

    expect(screen.getByLabelText('Weight value').textContent).toBe('12.5');
  });
});
