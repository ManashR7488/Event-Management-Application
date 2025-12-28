import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import useAuthStore from '../store/authStore';
import { getDashboardRoute, getMenuItemsForRole, isRouteActive } from '../utils/navigationHelpers';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const unauthenticatedLinks = [
    { label: 'Home', path: '/', icon: FaHome },
    { label: 'Login', path: '/login', icon: FaSignInAlt },
    { label: 'Register', path: '/register', icon: FaUserPlus },
  ];

  const menuItems = isAuthenticated && user?.role 
    ? getMenuItemsForRole(user.role) 
    : unauthenticatedLinks;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || isMobileMenuOpen 
        ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/10' 
        : 'bg-transparent border-b border-white/0'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Title */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
            onClick={closeMobileMenu}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🎉</span>
            <span className="text-2xl font-bold text-gradient">Fest Manager</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {/* Menu Items */}
            <div className="flex items-center gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isRouteActive(location.pathname, item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                      active
                        ? 'text-cyan-400'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon className={`text-sm ${active ? 'animate-pulse' : ''}`} />
                    <span>{item.label}</span>
                    {active && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-fade-in-up"></span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Profile Dropdown (Authenticated) */}
            {isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-300 ${
                     isProfileDropdownOpen 
                       ? 'bg-white/10 border-cyan-500/50 text-white' 
                       : 'bg-white/5 border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border border-white/20">
                    <FaUser className="text-xs" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-semibold leading-none mb-1">{user.name || user.email}</div>
                    <div className="text-[10px] text-cyan-400 font-medium tracking-wide uppercase">{user.role}</div>
                  </div>
                  <FaChevronDown className={`text-xs transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-60 glass-card rounded-xl shadow-2xl border border-white/10 py-2 z-20 animate-fade-in-up origin-top-right">
                      <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                        <div className="font-semibold text-white">{user.name || 'User'}</div>
                        <div className="text-xs text-slate-400 truncate mt-1">{user.email}</div>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                        >
                          <FaSignOutAlt />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-fade-in-up">
          <div className="px-4 py-6 space-y-2">
            {/* Menu Items */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(location.pathname, item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* User Info and Logout (Authenticated) */}
            {isAuthenticated && user && (
              <>
                <div className="border-t border-white/10 my-4 pt-4">
                  <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                         {user.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
                    </div>
                    <div>
                        <div className="font-semibold text-white">{user.name || 'User'}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
