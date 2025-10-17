import React, { useContext, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../routes/AppRoutes';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { Lock, LogIn, Phone, Mail } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare request data based on user type
      const requestData = userType === 'user' 
        ? { phoneNumber }
        : { email, password };

      const response = await axios.post('https://balajii-electronices.onrender.com/api/users/login', requestData);

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
          navigate('/user/');
        } else if (role === 'admin') {
          navigate('/admin/');
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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-100/20 to-transparent"></div>
        
        {/* Floating Squares */}
        <div className="absolute top-1/4 right-1/4 w-16 h-16 border-2 border-blue-300/30 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 border-2 border-purple-300/30 rotate-12 animate-bounce-slow"></div>
        <div className="absolute top-3/4 right-1/3 w-20 h-20 border-2 border-indigo-300/20 -rotate-12 animate-float"></div>
      </div>

      <div className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 transform hover:scale-[1.02] transition-transform duration-300">
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
