import React, { useState } from 'react';
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

  const login = (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole('');
  };

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
              <UserLayout>
                <Routes>
                  <Route path="/" element={<UserDashboard />} />
                  {/* Add more user routes here */}
                </Routes>
              </UserLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthContext.Provider>
  );
};

export default AppRoutes;