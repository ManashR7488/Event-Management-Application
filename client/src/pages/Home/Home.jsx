import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQrcode, FaUsers, FaChartLine, FaArrowRight, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign, FaUserFriends } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import { getAllEvents } from '../../api/eventService';
import { getDashboardRoute } from '../../utils/navigationHelpers';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await getAllEvents();
        
        if (result.success && result.data) {
          // Filter for active events with open registration
          const activeEvents = result.data.filter(
            event => event.isActive && event.registrationOpen
          );
          setEvents(activeEvents);
        } else {
          setError(result.error || 'Failed to fetch events');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleGoToDashboard = () => {
    if (user?.role) {
      navigate(getDashboardRoute(user.role));
    }
  };

  const handleRegisterForEvent = (eventId) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role === 'teamLead') {
      navigate('/dashboard/team-lead');
    } else {
      // Navigate authenticated non-teamLead users to their dashboard
      navigate(getDashboardRoute(user.role));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to Fest Manager
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              Your Complete Event Management Solution
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline team registrations, manage check-ins with QR codes, and track food distribution all in one powerful platform.
            </p>

            {/* Call to Action Buttons */}
            {isAuthenticated && user ? (
              <div className="space-y-4">
                <div className="bg-white border-2 border-blue-200 rounded-xl p-6 max-w-md mx-auto">
                  <p className="text-lg font-semibold text-gray-800 mb-2">Welcome back, {user.name || user.email}!</p>
                  <p className="text-sm text-gray-600 mb-4 capitalize">Logged in as {user.role}</p>
                  <button
                    onClick={handleGoToDashboard}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                  >
                    Go to Dashboard
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleGetStarted}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
                >
                  Get Started
                  <FaArrowRight />
                </button>
                <button
                  onClick={handleSignIn}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <FaQrcode className="text-4xl text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">QR-Based Check-in</h3>
              <p className="text-gray-600">
                Fast and secure attendance tracking using unique QR codes for each team member. Scan and verify in seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <FaUsers className="text-4xl text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Team Management</h3>
              <p className="text-gray-600">
                Easily register and manage teams with detailed member information. Track payments and registrations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 rounded-full">
                  <FaChartLine className="text-4xl text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Real-time Tracking</h3>
              <p className="text-gray-600">
                Monitor attendance, food distribution, and event statistics in real-time with comprehensive dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Active Events
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Register for upcoming events and join the excitement
          </p>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && events.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-gray-500 text-lg">No active events at the moment. Check back soon!</p>
            </div>
          )}

          {/* Events Grid */}
          {!isLoading && !error && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {event.eventType || 'Event'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaCalendarAlt className="text-sm" />
                        <span className="text-sm">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaMapMarkerAlt className="text-sm" />
                        <span className="text-sm">{event.venue || 'Venue TBA'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaUserFriends className="text-sm" />
                        <span className="text-sm">
                          Team Size: {event.minTeamSize} - {event.maxTeamSize} members
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaDollarSign className="text-sm" />
                        <span className="text-sm font-semibold">
                          Registration Fee: ₹{event.registrationFee || 0}
                        </span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {event.description}
                      </p>
                    )}

                    <button
                      onClick={() => handleRegisterForEvent(event._id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {isAuthenticated && user?.role === 'teamLead' ? 'Manage Registration' : 'Register Now'}
                      <FaArrowRight className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Fest Manager</h3>
              <p className="text-gray-400">
                Simplifying event management with powerful tools for organizers, staff, and participants.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@festmanager.com</li>
                <li>Phone: +91 1234567890</li>
                <li className="flex gap-3 mt-4">
                  <a href="#" className="hover:text-white transition-colors">Facebook</a>
                  <a href="#" className="hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="hover:text-white transition-colors">Instagram</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Fest Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;