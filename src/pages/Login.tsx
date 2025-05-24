import React, { useContext, useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../routes/AppRoutes';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { User, Lock, LogIn, Phone, Mail } from 'lucide-react';
import axios from 'axios';

const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Auto-login if data exists in localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUserType = localStorage.getItem('userType');
      
      if (token && savedUserType) {
        try {
          // Verify token with backend
          const response = await axios.get('http://localhost:4000/api/users/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.data.success) {
            // Update auth context
            login(savedUserType);
            
            // Navigate based on role
            if (savedUserType === 'user') {
              navigate('/user/Dashboard');
            } else if (savedUserType === 'admin') {
              navigate('/admin/*');
            }
          } else {
            // If token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            localStorage.removeItem('userName');
          }
        } catch (error) {
          console.error('Auth check error:', error);
          // If there's an error, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
          localStorage.removeItem('userName');
        }
      }
    };

    checkAuth();
  }, [navigate, login]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare request data based on user type
      const requestData = userType === 'user' 
        ? { phoneNumber }
        : { email, password };

      const response = await axios.post('http://localhost:4000/api/users/login', requestData);

      if (response.data.success) {
        const { token, role, name } = response.data.userData;
        
        // Save auth data
        localStorage.setItem('token', token);
        localStorage.setItem('userType', role);
        localStorage.setItem('userName', name);

        // Update auth context
        login(role);

        // Navigate based on role
        if (role === 'user') {
          navigate('/user/dashboard');
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        }
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32">
                <Logo className="w-full h-full" />
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2 pt-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 text-sm sm:text-base">Sign in to continue to Dashboard</p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 py-4 mt-4">
            <div 
              className={`flex items-center space-x-2 cursor-pointer ${
                userType === 'user' ? 'text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => {
                setUserType('user');
                setError(''); // Clear error when switching user type
              }}
            >
              <input
                type="radio"
                checked={userType === 'user'}
                onChange={() => {
                  setUserType('user');
                  setError('');
                }}
                className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-blue-600"
              />
              <span className="text-sm font-medium">User</span>
            </div>
            <div 
              className={`flex items-center space-x-2 cursor-pointer ${
                userType === 'admin' ? 'text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => {
                setUserType('admin');
                setError(''); // Clear error when switching user type
              }}
            >
              <input
                type="radio"
                checked={userType === 'admin'}
                onChange={() => {
                  setUserType('admin');
                  setError('');
                }}
                className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-blue-600"
              />
              <span className="text-sm font-medium">Admin</span>
            </div>
          </div>

          {error && (
            <Alert 
              variant="danger"
              className="mt-4 mb-4 bg-red-50 text-red-700 border-red-100 rounded-lg p-4 text-sm"
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="mt-4 space-y-5">
            {userType === 'user' ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <Form.Control
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setError(''); // Clear error when typing
                  }}
                  className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(''); // Clear error when typing
                    }}
                    className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(''); // Clear error when typing
                    }}
                    className="pl-10 w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    minLength={6}
                    required
                  />
                </div>
              </>
            )}

            <Button 
              variant="primary"
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors text-base mt-4"
              disabled={loading}
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </Button>

            <div className="text-center mt-4">
              <p className="text-xs sm:text-sm text-gray-600">
                {userType === 'user' 
                  ? 'Enter your 10-digit phone number' 
                  : 'Enter your email and password'}
              </p>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login; 