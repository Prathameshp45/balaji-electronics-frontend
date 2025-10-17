import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import UserLayout from '../components/layout/UserLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import UserDashboard from '../pages/user/Dashboard';
import Login from '../pages/Login';
import ProductList from '../components/ProductList';
import ExcelImport from '../components/ExcelImport';
import ProductManagement from '../components/ProductManagement';
// Simple auth context - in a real app, this would be more robust
export const AuthContext = React.createContext<{
  isLoggedIn: boolean;
  userRole: string;
  login: (role: string) => void;
  logout: () => void;
}>({
  isLoggedIn: false,
  userRole: '',
  login: () => {},
  logout: () => {},
});

const AppRoutes = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const login = (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole('');
  };

  // Initialize authentication from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const savedUserType = localStorage.getItem('userType');
      
      if (token && savedUserType) {
        // Restore authentication state
        setIsLoggedIn(true);
        setUserRole(savedUserType);
      }
      
      // Mark auth check as complete
      setIsCheckingAuth(false);
    };

    initAuth();
  }, []);
  // Protected route component
  const ProtectedRoute = ({ 
    children, 
    requiredRole 
  }: { 
    children: React.ReactNode;
    requiredRole?: string;
  }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to={`/${userRole}`} replace />;
    }

    return <>{children}</>;
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, login, logout }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/import" element={<ExcelImport />} />
                  <Route path='/ProductManagement' element={<ProductManagement/>}/>
                  {/* Add more admin routes here */}
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/user/*" 
          element={
            <ProtectedRoute requiredRole="user">
              <Routes>
                <Route path="/" element={<UserLayout />} />
                <Route path="/Dashboard" element={<UserDashboard />} />
                {/* Add more user routes here */}
              </Routes>
            </ProtectedRoute>
          } 
        />

        {/* Default redirect */}
        <Route 
          path="*" 
          element={
            isLoggedIn ? (
              <Navigate to={`/${userRole}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </AuthContext.Provider>
  );
};

export default AppRoutes;
