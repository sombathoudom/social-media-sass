import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface FlashMessages {
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

export default function Toast() {
  const { flash } = usePage().props as { flash?: FlashMessages };

  useEffect(() => {
    if (flash) {
      if (flash.success) {
        toast.success(flash.success);
      }
      if (flash.error) {
        toast.error(flash.error);
      }
      if (flash.warning) {
        toast.warning(flash.warning);
      }
      if (flash.info) {
        toast.info(flash.info);
      }
    }
  }, [flash]);

  return null;
}
