
// import { userData } from "@/lib/data";

const WelcomeBar = ({UserName, UserRole}) => {
  // Get current time of day
  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Format today's date
  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {/* {getCurrentTimeGreeting()}, {userData.name}! */}
            {getCurrentTimeGreeting()}, {UserName}!
          </h1>
          <p className="text-gray-600 mt-1">
            {getTodayDate()}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
            <span className="mr-1 w-2 h-2 rounded-full bg-blue-500"></span>
            {/* {userData.role} */}
            {UserRole}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBar;
