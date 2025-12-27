import { FaTachometerAlt, FaUsers, FaCalendarAlt, FaQrcode, FaCog, FaChartLine, FaClipboardList } from 'react-icons/fa';

// Get dashboard route based on user role
export const getDashboardRoute = (role) => {
  const routes = {
    admin: '/dashboard/admin',
    organizer: '/dashboard/organizer',
    staff: '/dashboard/staff',
    teamLead: '/dashboard/team-lead',
  };
  
  return routes[role] || '/';
};

// Get menu items based on user role
export const getMenuItemsForRole = (role) => {
  const menuItems = {
    admin: [
      { label: 'Dashboard', path: '/dashboard/admin', icon: FaTachometerAlt },
    ],
    organizer: [
      { label: 'Dashboard', path: '/dashboard/organizer', icon: FaTachometerAlt },
      { label: 'Food Eligibility', path: '/food-eligibility', icon: FaQrcode },
    ],
    staff: [
      { label: 'Dashboard', path: '/dashboard/staff', icon: FaTachometerAlt },
      { label: 'Food Eligibility', path: '/food-eligibility', icon: FaQrcode },
    ],
    teamLead: [
      { label: 'Dashboard', path: '/dashboard/team-lead', icon: FaTachometerAlt },
      { label: 'Food Eligibility', path: '/food-eligibility', icon: FaQrcode },
    ],
  };
  
  return menuItems[role] || [];
};

// Check if a route is currently active
export const isRouteActive = (currentPath, routePath) => {
  if (routePath === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(routePath);
};
