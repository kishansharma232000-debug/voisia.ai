import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  LayoutDashboard, 
  Calendar, 
  History, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Crown,
  Circle,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Connect Phone', href: '/connect-phone', icon: Phone },
    { name: 'Google Calendar', href: '/google-calendar', icon: Calendar },
    { name: 'Booking History', href: '/booking-history', icon: History },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Call Logs', href: '/call-logs', icon: History },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3,
      proOnly: true
    },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const getPlanColor = (plan: string | null) => {
    switch (plan) {
      case 'starter': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'business': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (plan: string | null) => {
    if (!plan) return 'No Plan';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 lg:pl-64">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Plan & Status Info */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Current Plan:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(user?.plan)}`}>
                {user?.plan === 'business' && <Crown className="w-3 h-3 mr-1" />}
                {getPlanName(user?.plan)}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">AI Assistant:</span>
              <div className="flex items-center space-x-2">
                <Circle className={`w-3 h-3 ${user?.plan ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                <span className={`text-sm font-medium ${user?.plan ? 'text-green-600' : 'text-gray-500'}`}>
                  {user?.plan ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
        
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">VoisiaAI</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.clinicName || 'My Clinic'}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const isDisabled = item.proOnly && (!user?.plan || user.plan === 'starter');
                
                return (
                  <Link
                    key={item.name}
                    to={isDisabled ? '#' : item.href}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                        return;
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${
                      isActive 
                        ? 'text-blue-700' 
                        : isDisabled 
                        ? 'text-gray-400' 
                        : 'text-gray-400'
                    }`} />
                    <span>{item.name}</span>
                    {item.proOnly && (
                      <Crown className="w-4 h-4 text-orange-500" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-6">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64 pt-16">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}