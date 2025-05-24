import { Card, Row, Col } from 'react-bootstrap';
import { FileText, Bell, Calendar, CheckSquare, ChevronRight } from 'lucide-react';

const UserDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="text-gray-600">Here's what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-semibold text-gray-900">16</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">3 new this week</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-semibold text-gray-900">8</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">2 unread messages</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">Events this week</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">Tasks finished</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Your Tasks</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Complete profile information</h3>
                  <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">In Progress</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">Due in 2 days</p>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Review documents</h3>
                  <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">Pending</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">Due in 5 days</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Update security settings</h3>
                  <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Completed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">Completed yesterday</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Notifications</h2>
          <div className="space-y-4">
            {[
              { icon: <Bell />, title: 'Your document has been approved', time: '2 hours ago', color: 'blue' },
              { icon: <Calendar />, title: 'Meeting scheduled for tomorrow', time: '1 day ago', color: 'green' },
              { icon: <FileText />, title: 'New document available for review', time: '3 days ago', color: 'yellow' }
            ].map((notification, index) => (
              <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 bg-${notification.color}-100 rounded-lg`}>
                  {notification.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-500">{notification.time}</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
          <button className="mt-6 w-full text-center text-sm text-blue-600 hover:text-blue-700">
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;