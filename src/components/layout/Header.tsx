import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../routes/AppRoutes';
import Logo from '../common/Logo';
import { User } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  children?: React.ReactNode;
}

const Header = ({ isAdmin, children }: HeaderProps) => {
  const { logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    logout();
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/20 backdrop-blur-3xl backdrop-saturate-200 border-b border-white/10 shadow-sm relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Brand Name */}
          <div className="flex items-center space-x-3">
            {children}
            <Logo className="h-10 w-10" />
            <span className="font-bold text-xl text-gray-900">
              Balaji Electronics
            </span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            {/* <button className="p-2 rounded-full bg-white/15 backdrop-blur-xl hover:bg-white/30 text-gray-700 transition-all duration-300 border border-white/20">
              <Bell size={20} />
            </button> */}

            <div className="relative z-[100]" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 rounded-full bg-white/15 backdrop-blur-xl hover:bg-white/30 text-gray-700 transition-all duration-300 border border-white/20"
              >
                <User size={20} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white/25 backdrop-blur-3xl backdrop-saturate-200 rounded-2xl shadow-2xl py-2 border border-white/20">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-white/25 rounded-xl mx-1 transition-all duration-200 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
