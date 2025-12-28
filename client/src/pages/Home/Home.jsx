import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQrcode, FaUsers, FaChartLine, FaArrowRight, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign, FaUserFriends, FaRegStar } from 'react-icons/fa';
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
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animate-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-blue-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animate-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
            <div className="lg:w-1/2 space-y-8 animate-fade-in-up">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 backdrop-blur-md">
                <span className="text-blue-400 text-sm font-semibold tracking-wide uppercase">The Future of Event Management</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight">
                <span className="block text-white">Elevate Your</span>
                <span className="text-gradient">Fest Experience</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Streamline registrations, manage teams effortlessly, and track real-time analytics. The all-in-one platform designed for modern campus events.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                {isAuthenticated && user ? (
                  <div className="glass-card p-6 rounded-2xl w-full max-w-md border-l-4 border-l-cyan-500">
                    <p className="text-lg font-semibold text-white mb-1">Welcome back, {user.name || user.email}!</p>
                    <p className="text-sm text-slate-400 mb-4 capitalize">Role: {user.role}</p>
                    <button
                      onClick={handleGoToDashboard}
                      className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 font-semibold text-lg w-full overflow-hidden"
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shimmer" />
                      Go to Dashboard
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleGetStarted}
                      className="group relative px-8 py-4 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors font-bold text-lg shadow-lg shadow-white/10 w-full sm:w-auto"
                    >
                      Get Started
                      <FaArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={handleSignIn}
                      className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors font-semibold text-lg w-full sm:w-auto backdrop-blur-sm"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Abstract Visual Elements */}
            <div className="lg:w-1/2 relative min-h-[400px] w-full flex items-center justify-center perspective-1000 hidden lg:flex">
                <div className="relative w-80 h-96 glass-card rounded-2xl transform rotate-y-[-12deg] rotate-x-[5deg] z-10 animate-float p-6 flex flex-col justify-between">
                     <div className="h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl mb-4 border border-white/10"></div>
                     <div className="space-y-3">
                         <div className="h-4 bg-white/10 rounded w-3/4"></div>
                         <div className="h-4 bg-white/10 rounded w-1/2"></div>
                     </div>
                     <div className="mt-6 flex justify-between items-center">
                         <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-red-400 border-2 border-slate-900"></div>
                            <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-slate-900"></div>
                            <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-slate-900"></div>
                         </div>
                         <div className="text-xs text-slate-400">Active Users</div>
                     </div>
                </div>
                
                <div className="absolute -right-12 top-20 w-64 h-72 glass-card rounded-2xl transform translate-z-[-50px] rotate-12 z-0 opacity-70 border-white/5 bg-slate-800/50 p-5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500/20 rounded-lg"><FaChartLine className="text-green-400" /></div>
                        <div className="text-sm font-semibold">Live Analytics</div>
                    </div>
                    <div className="space-y-4">
                         <div className="flex justify-between text-xs text-slate-400"><span>Check-ins</span><span>85%</span></div>
                         <div className="w-full bg-slate-700/50 rounded-full h-1.5"><div className="bg-green-400 h-1.5 rounded-full w-[85%]"></div></div>
                         <div className="flex justify-between text-xs text-slate-400"><span>Registrations</span><span>62%</span></div>
                         <div className="w-full bg-slate-700/50 rounded-full h-1.5"><div className="bg-blue-400 h-1.5 rounded-full w-[62%]"></div></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-cyan-400 tracking-wide uppercase mb-2">Platform Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Tools for Organizers</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to run a successful event, from registration to real-time analytics.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card glass-card-hover rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
                <FaQrcode className="text-2xl" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">QR Check-Ins</h4>
              <p className="text-slate-400 leading-relaxed">
                Lightning fast entry management using secure QR codes. Eliminate queues and track attendance in real-time.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                <FaUsers className="text-2xl" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Team Management</h4>
              <p className="text-slate-400 leading-relaxed">
                Seamlessly handle team registrations, member details, and payment verification all in one dashboard.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
              <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300 border border-cyan-500/20">
                <FaChartLine className="text-2xl" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Live Analytics</h4>
              <p className="text-slate-400 leading-relaxed">
                Make data-driven decisions with real-time insights on food distribution, footfall, and engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="relative z-10 py-24 bg-slate-900/50 backdrop-blur-sm border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Upcoming Events</h2>
               <p className="text-slate-400">Discover and register for the latest events.</p>
            </div>
            {/* Optional: Add a 'View All' link/button here if needed */}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-20 h-20">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700/50 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-400 mt-4 animate-pulse">Loading amazing events...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto backdrop-blur-md">
              <p className="text-red-400 text-lg font-medium mb-2">Oops! Something went wrong.</p>
              <p className="text-slate-400">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && events.length === 0 && (
            <div className="glass-card rounded-2xl p-16 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCalendarAlt className="text-3xl text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Events</h3>
              <p className="text-slate-400">We're currently preparing new events. Check back soon!</p>
            </div>
          )}

          {/* Events Grid */}
          {!isLoading && !error && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="glass-card group rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-colors duration-300 flex flex-col"
                >
                  {/* Event Image Placeholder / Header */}
                  <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 relative p-6 flex flex-col justify-end">
                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10 flex items-center gap-1">
                          <FaRegStar className="text-yellow-400" />
                          {event.eventType || 'Featured'}
                      </div>
                      <h3 className="text-2xl font-bold text-white leading-tight z-10 group-hover:text-cyan-400 transition-colors">{event.name}</h3>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="space-y-4 mb-6 flex-1">
                      <div className="flex items-center gap-3 text-slate-300">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 shrink-0">
                             <FaCalendarAlt className="text-sm" />
                        </div>
                        <span className="text-sm font-medium">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 shrink-0">
                             <FaMapMarkerAlt className="text-sm" />
                        </div>
                        <span className="text-sm">{event.venue || 'Venue TBA'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 shrink-0">
                             <FaUserFriends className="text-sm" />
                        </div>
                        <span className="text-sm">
                          Team: {event.minTeamSize} - {event.maxTeamSize} members
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 shrink-0">
                             <FaDollarSign className="text-sm" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide">
                          {event.registrationFee ? `₹${event.registrationFee} Entry Fee` : 'Free Registration'}
                        </span>
                      </div>
                      
                       {event.description && (
                         <p className="text-sm text-slate-400 mt-4 line-clamp-2 border-t border-white/5 pt-4">
                           {event.description}
                         </p>
                       )}
                    </div>

                    <button
                      onClick={() => handleRegisterForEvent(event._id)}
                      className="w-full py-3 bg-white/5 hover:bg-cyan-600 hover:text-white border border-white/10 hover:border-cyan-500 rounded-xl text-cyan-400 font-semibold transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-cyan-500/20"
                    >
                      {isAuthenticated && user?.role === 'teamLead' ? 'Manage Registration' : 'Register Now'}
                      <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative z-10 bg-slate-950 pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">Fest Manager</h3>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                The ultimate platform for organizing and experiencing campus events. Simplify the chaos, amplify the fun.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Events</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Fest Manager. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
               <a href="#" className="hover:text-white transition-colors">Twitter</a>
               <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
               <a href="#" className="hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;