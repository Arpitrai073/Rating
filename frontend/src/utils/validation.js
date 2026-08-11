export const validateName = (name) => {
  if (!name || name.trim().length < 20) return 'Name must be at least 20 characters';
  if (name.trim().length > 60) return 'Name must be at most 60 characters';
  return '';
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return '';
};

export const validateAddress = (address) => {
  if (!address || !address.trim()) return 'Address is required';
  if (address.length > 400) return 'Address must be at most 400 characters';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8 || password.length > 16) return 'Password must be 8-16 characters';
  if (!/[A-Z]/.test(password)) return 'Password needs at least one uppercase letter';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return 'Password needs at least one special character';
  }
  return '';
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((e) => e.message).join('. ');
  }
  return error.response?.data?.message || error.message || 'Something went wrong';
};
