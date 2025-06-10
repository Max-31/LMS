
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Users, Building2 } from "lucide-react";

const LMSInfo = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Library Management System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-sm font-medium text-blue-800">Digital Catalog</p>
            <p className="text-xs text-blue-600">Browse & Search Books</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Clock className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-sm font-medium text-green-800">24/7 Access</p>
            <p className="text-xs text-green-600">Request Books Anytime</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-sm font-medium text-purple-800">Multi-Role Support</p>
            <p className="text-xs text-purple-600">Students, Faculty & Staff</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Building2 className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <p className="text-sm font-medium text-orange-800">University Library</p>
            <p className="text-xs text-orange-600">Central Resource Hub</p>
          </div>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600">
          <h4 className="font-medium text-gray-800">System Features:</h4>
          <ul className="space-y-1 text-xs">
            <li>• Browse and search comprehensive book catalog</li>
            <li>• Request books online with instant notifications</li>
            <li>• Track borrowed books and due dates</li>
            <li>• Role-based access for different user types</li>
            <li>• Automated fine calculation for students</li>
            <li>• Extended access privileges for faculty and guests</li>
          </ul>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-800 text-xs mb-2">Quick Access:</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <p>📚 <strong>Search Books:</strong> Use the search feature to find resources</p>
              <p>📋 <strong>My Books:</strong> Track your current borrowings</p>
              <p>🔔 <strong>Notifications:</strong> Stay updated on due dates</p>
              <p>👤 <strong>Profile:</strong> Manage your account information</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LMSInfo;
