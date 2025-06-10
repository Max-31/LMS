
import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { notifications as initialNotifications } from "@/lib/data";
import NotificationItem, { NotificationType } from "@/components/NotificationItem";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    toast.success("Notification marked as read");
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success("All notifications marked as read");
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all as read</span>
            </Button>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                {...notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No notifications to display</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;
