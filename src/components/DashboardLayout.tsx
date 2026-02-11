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
  Link as LinkIcon,
  Building2,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { INDUSTRY_CONFIGS } from '../types/industry';

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

  // Get industry-specific labels
  const industryConfig = INDUSTRY_CONFIGS[user?.industryType || 'clinic'];
  const appointmentLabel = industryConfig.appointmentLabel;

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Connect Phone', href: '/connect-phone', icon: Phone },
    { name: 'Google Calendar', href: '/google-calendar', icon: Calendar },
    { name: 'Booking History', href: '/booking-history', icon: History },
    { name: appointmentLabel, href: '/appointments', icon: Calendar },
    { name: 'Call Logs', href: '/call-logs', icon: History },
    { name: 'Industry Settings', href: '/industry-settings', icon: Building2 },
    { name: 'FAQs', href: '/faq-management', icon: HelpCircle },
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
          <div className="flex items-center space-x-8 ml-auto lg:ml-0">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600">Plan:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPlanColor(user?.plan)}`}>
                {user?.plan === 'business' && <Crown className="w-3.5 h-3.5 mr-1.5" />}
                {getPlanName(user?.plan)}
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600">Assistant:</span>
              <div className="flex items-center space-x-2">
                <Circle className={`w-2.5 h-2.5 ${user?.plan ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                <span className={`text-sm font-medium ${user?.plan ? 'text-green-600' : 'text-gray-500'}`}>
                  {user?.plan ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col`}>

        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">VoisiaAI</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex-shrink-0">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-100 text-sm truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.clinicName || 'My Clinic'}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-400'
                      : isDisabled
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${
                    isActive
                      ? 'text-blue-400'
                      : isDisabled
                      ? 'text-slate-700'
                      : 'text-slate-500 group-hover:text-slate-300'
                  }`} />
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.proOnly && (
                    <Crown className="w-4 h-4 text-amber-400 flex-shrink-0 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-700 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-slate-300 hover:bg-red-600/20 hover:text-red-300 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5 text-slate-500" />
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