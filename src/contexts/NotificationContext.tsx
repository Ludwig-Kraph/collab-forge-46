import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listen for transaction and payment request events
    const channel = supabase
      .channel('notification-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const transaction = payload.new;
          const newNotification: Notification = {
            id: `notif-${transaction.id}`,
            title: 'New Transaction',
            message: `${transaction.transaction_type === 'received' ? 'Received' : 'Sent'} KES ${transaction.amount}`,
            type: 'success',
            read: false,
            created_at: new Date().toISOString(),
          };
          
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_requests',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const payment = payload.new as any;
          
          // Only notify on status changes to completed or failed
          if (payment.status === 'completed') {
            const notification: Notification = {
              id: `payment-${payment.id}`,
              title: 'Payment Completed',
              message: `Customer paid KES ${payment.amount}. Transaction successful!`,
              type: 'success',
              read: false,
              created_at: new Date().toISOString(),
            };
            setNotifications((prev) => [notification, ...prev]);
          } else if (payment.status === 'failed') {
            const notification: Notification = {
              id: `payment-${payment.id}`,
              title: 'Payment Failed',
              message: payment.result_desc || `Payment of KES ${payment.amount} was not completed.`,
              type: 'error',
              read: false,
              created_at: new Date().toISOString(),
            };
            setNotifications((prev) => [notification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
