// Example usage of Sonner toast in your components
import { toast } from 'sonner';

// Success toast
export const showSuccess = () => {
  toast.success('Campaign created successfully!');
};

// Error toast
export const showError = () => {
  toast.error('Failed to create campaign');
};

// Warning toast
export const showWarning = () => {
  toast.warning('Please select at least one page');
};

// Info toast
export const showInfo = () => {
  toast.info('Processing your request...');
};

// Loading toast
export const showLoading = () => {
  const toastId = toast.loading('Creating campaign...');
  
  // Later, dismiss or update it
  setTimeout(() => {
    toast.success('Campaign created!', { id: toastId });
  }, 2000);
};

// Promise toast (auto handles loading/success/error)
export const showPromise = async () => {
  const promise = fetch('/api/data').then(res => res.json());
  
  toast.promise(promise, {
    loading: 'Loading...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data',
  });
};

// Custom toast with action
export const showWithAction = () => {
  toast('Campaign deleted', {
    action: {
      label: 'Undo',
      onClick: () => console.log('Undo clicked'),
    },
  });
};

// Rich colors (already enabled in Toaster)
// - success: green
// - error: red
// - warning: yellow
// - info: blue
