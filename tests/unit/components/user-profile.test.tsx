/**
 * UserProfile Component Unit Tests
 * Tests for user profile display and editing functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '@/components/user/user-profile';
import { User } from '@/types';

// Mock user data
const mockUser: User = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  settings: {
    units: 'kg',
    defaultRestTime: 120,
    theme: 'light'
  },
  createdAt: '2024-01-01T00:00:00Z'
};

describe('UserProfile Component', () => {
  const mockOnUpdate = jest.fn();
  const mockOnPasswordChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render user profile in view mode', () => {
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
  });

  it('should switch to edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should populate form fields with current user data in edit mode', async () => {
    const user = userEvent.setup();
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    
    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
  });

  it('should update name field', async () => {
    const user = userEvent.setup();
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Smith');
    
    expect(nameInput).toHaveValue('Jane Smith');
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    const nameInput = screen.getByLabelText(/name/i);
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    await user.clear(nameInput);
    await user.click(saveButton);
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    const emailInput = screen.getByLabelText(/email/i);
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    await user.click(saveButton);
    
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should save valid profile updates', async () => {
    const user = userEvent.setup();
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    const nameInput = screen.getByLabelText(/name/i);
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Smith');
    await user.click(saveButton);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockUser,
      name: 'Jane Smith'
    });
  });

  it('should cancel editing and revert changes', async () => {
    const user = userEvent.setup();
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    const nameInput = screen.getByLabelText(/name/i);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    
    await user.clear(nameInput);
    await user.type(nameInput, 'Changed Name');
    await user.click(cancelButton);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should show loading state during save', async () => {
    const user = userEvent.setup();
    render(
      <UserProfile 
        user={mockUser} 
        onUpdate={mockOnUpdate} 
        isLoading={true} 
      />
    );
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display error messages', () => {
    render(
      <UserProfile 
        user={mockUser} 
        onUpdate={mockOnUpdate}
        error="Failed to update profile"
      />
    );
    
    expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
  });

  it('should show success message after update', () => {
    render(
      <UserProfile 
        user={mockUser} 
        onUpdate={mockOnUpdate}
        success="Profile updated successfully"
      />
    );
    
    expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
  });

  it('should show change password section', () => {
    render(
      <UserProfile 
        user={mockUser} 
        onUpdate={mockOnUpdate}
        onPasswordChange={mockOnPasswordChange}
      />
    );
    
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('should handle password change', async () => {
    const user = userEvent.setup();
    render(
      <UserProfile 
        user={mockUser} 
        onUpdate={mockOnUpdate}
        onPasswordChange={mockOnPasswordChange}
      />
    );
    
    const changePasswordButton = screen.getByRole('button', { name: /change password/i });
    await user.click(changePasswordButton);
    
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('should validate password confirmation', async () => {
    const user = userEvent.setup();
    render(
      <UserProfile 
        user={mockUser} 
        onUpdate={mockOnUpdate}
        onPasswordChange={mockOnPasswordChange}
      />
    );
    
    const changePasswordButton = screen.getByRole('button', { name: /change password/i });
    await user.click(changePasswordButton);
    
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const savePasswordButton = screen.getByRole('button', { name: /save password/i });
    
    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'differentpassword');
    await user.click(savePasswordButton);
    
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('should show user avatar', () => {
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByAltText('User avatar')).toBeInTheDocument();
  });

  it('should handle avatar upload', async () => {
    const user = userEvent.setup();
    const mockOnAvatarUpdate = jest.fn();
    
    render(
      <UserProfile 
        user={mockUser} 
        onUpdate={mockOnUpdate}
        onAvatarUpdate={mockOnAvatarUpdate}
      />
    );
    
    const avatarUpload = screen.getByLabelText(/upload avatar/i);
    const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
    
    await user.upload(avatarUpload, file);
    
    expect(mockOnAvatarUpdate).toHaveBeenCalledWith(file);
  });

  it('should display account creation date', () => {
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText(/member since/i)).toBeInTheDocument();
    expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
  });

  it('should handle keyboard navigation in edit mode', async () => {
    const user = userEvent.setup();
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    await user.click(nameInput);
    await user.tab();
    
    expect(emailInput).toHaveFocus();
  });

  it('should handle escape key to cancel editing', async () => {
    const user = userEvent.setup();
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);
    
    await user.keyboard('{Escape}');
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
  });
});