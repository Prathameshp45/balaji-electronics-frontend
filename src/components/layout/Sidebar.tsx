import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FileUp,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar = ({ onCloseMobile }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === `/admin${path}`;
  };

  const handleNavigation = (path: string) => {
    navigate(`/admin${path}`);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const menuItems = [
    { path: '', icon: <LayoutDashboard size={18} />, text: 'Dashboard' },
    { path: '/ProductManagement', icon: <Users size={18} />, text: 'Product Management' },
    { path: '/import', icon: <Users size={18} />, text: 'Manage Numbers' },
    { path: '/products', icon: <ShoppingCart size={18} />, text: 'Product List' },
    // { path: '/import', icon: <FileUp size={18} />, text: 'User Dashboard' },
  ];

  return (
    <nav className="h-screen bg-white shadow-md overflow-y-auto">
      <div className="py-4 space-y-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center space-x-3 px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
              isActive(item.path) ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.text}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;
