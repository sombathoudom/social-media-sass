import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

interface FlashMessages {
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

export default function Toast() {
  const { flash } = usePage().props as { flash?: FlashMessages };
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<{ type: keyof FlashMessages; text: string } | null>(null);

  useEffect(() => {
    if (flash) {
      const type = Object.keys(flash).find((key) => flash[key as keyof FlashMessages]) as
        | keyof FlashMessages
        | undefined;

      if (type && flash[type]) {
        setMessage({ type, text: flash[type]! });
        setVisible(true);

        const timer = setTimeout(() => {
          setVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [flash]);

  if (!visible || !message) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    error: <XCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    info: <AlertCircle className="h-5 w-5 text-blue-600" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-5">
      <Alert className={`${colors[message.type]} border shadow-lg`}>
        <div className="flex items-start gap-3">
          {icons[message.type]}
          <AlertDescription className="flex-1">{message.text}</AlertDescription>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Alert>
    </div>
  );
}
