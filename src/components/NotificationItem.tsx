
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, BookOpen } from "lucide-react";

export type NotificationType = "due_date" | "new_arrival" | "fine";

type NotificationItemProps = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  onMarkAsRead?: (id: string) => void;
};

const NotificationItem = ({
  id,
  type,
  title,
  message,
  date,
  read,
  onMarkAsRead,
}: NotificationItemProps) => {
  const getIcon = () => {
    switch (type) {
      case "due_date":
        return (
          <div className="rounded-full p-2 bg-amber-100">
            <Calendar className="h-5 w-5 text-amber-600" />
          </div>
        );
      case "new_arrival":
        return (
          <div className="rounded-full p-2 bg-green-100">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
        );
      case "fine":
        return (
          <div className="rounded-full p-2 bg-red-100">
            <Bell className="h-5 w-5 text-red-600" />
          </div>
        );
      default:
        return (
          <div className="rounded-full p-2 bg-blue-100">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "p-4 border-b border-gray-100 flex items-start gap-3 transition-colors",
        !read && "bg-blue-50",
        read && "hover:bg-gray-50"
      )}
    >
      {getIcon()}
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm">{title}</h4>
          <span className="text-xs text-gray-500">{formatDate(date)}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
        
        <div className="mt-2 flex justify-between items-center">
          {!read && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
              New
            </Badge>
          )}
          {!read && onMarkAsRead && (
            <button
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => onMarkAsRead(id)}
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
