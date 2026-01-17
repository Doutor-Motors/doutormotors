import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertToast } from '@/components/ui/alert-toast';
import { useNotification } from '@/contexts/NotificationContext';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <AlertToast
              variant={notification.type}
              styleVariant={notification.styleVariant}
              title={notification.title}
              description={notification.description}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;
