import React from 'react';
import { AnimatePresence } from 'framer-motion';
import AdminNotificationCard from '@/components/ui/admin-notification';
import { useAdminNotification } from '@/contexts/AdminNotificationContext';

const AdminNotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useAdminNotification();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <AdminNotificationCard
              title={notification.title}
              subtitle={notification.subtitle}
              message={notification.message}
              highlight={notification.highlight}
              secondaryMessage={notification.secondaryMessage}
              icon={notification.icon}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AdminNotificationContainer;
