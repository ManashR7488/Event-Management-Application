import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaEdit, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaMoneyBillWave, FaTrash, FaQrcode } from 'react-icons/fa';
import { getAllEvents, createEvent, updateEvent, deleteEvent, getEventCanteenQR } from '../../../api/eventService';
import { toast } from 'react-toastify';
import EventQRDisplay from '../../../components/EventQRDisplay';
import {
  validateEventName,
  validateEventSlug,
  validateEventDescription,
  validateEventDates,
  validateVenue,
  validateRegistrationFee,
  validateTeamSize,
  validateMaxTeams,
} from '../../../utils/validation';

const EventsTab = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, eventId: null, eventName: '' });
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrEventData, setQREventData] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'hackathon',
    startDate: '',
    endDate: '',
    venue: '',
    registrationFeePerMember: 0,
    minTeamSize: 1,
    maxTeamSize: 4,
    maxTeams: '',
    registrationOpen: true,
    isActive: true,
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAllEvents();
    setIsLoading(false);
    
    if (result.success) {
      setEvents(result.data || []);
    } else {
      setError(result.error || 'Failed to load events');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    const nameError = validateEventName(formData.name);
    if (nameError) errors.name = nameError;
    
    const slugError = validateEventSlug(formData.slug);
    if (slugError) errors.slug = slugError;
    
    const descriptionError = validateEventDescription(formData.description);
    if (descriptionError) errors.description = descriptionError;
    
    const dateError = validateEventDates(formData.startDate, formData.endDate);
    if (dateError) errors.dates = dateError;
    
    const venueError = validateVenue(formData.venue);
    if (venueError) errors.venue = venueError;
    
    const feeError = validateRegistrationFee(formData.registrationFeePerMember);
    if (feeError) errors.registrationFeePerMember = feeError;
    
    const teamSizeError = validateTeamSize(formData.minTeamSize, formData.maxTeamSize);
    if (teamSizeError) errors.teamSize = teamSizeError;
    
    const maxTeamsError = validateMaxTeams(formData.maxTeams);
    if (maxTeamsError) errors.maxTeams = maxTeamsError;
    
    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: 'hackathon',
      startDate: '',
      endDate: '',
      venue: '',
      registrationFeePerMember: 0,
      minTeamSize: 1,
      maxTeamSize: 4,
      maxTeams: '',
      registrationOpen: true,
      isActive: true,
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (event) => {
    setSelectedEvent(event);
    setFormData({
      name: event.name || '',
      slug: event.slug || '',
      description: event.description || '',
      type: event.type || 'hackathon',
      startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      venue: event.venue || '',
      registrationFeePerMember: event.registrationFeePerMember || 0,
      minTeamSize: event.minTeamSize || 1,
      maxTeamSize: event.maxTeamSize || 4,
      maxTeams: event.maxTeams || '',
      registrationOpen: event.registrationOpen !== undefined ? event.registrationOpen : true,
      isActive: event.isActive !== undefined ? event.isActive : true,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedEvent(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: 'hackathon',
      startDate: '',
      endDate: '',
      venue: '',
      registrationFeePerMember: 0,
      minTeamSize: 1,
      maxTeamSize: 4,
      maxTeams: '',
      registrationOpen: true,
      isActive: true,
    });
    setFormErrors({});
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    const submitData = { ...formData };
    if (!submitData.maxTeams) delete submitData.maxTeams;
    
    const result = await createEvent(submitData);
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success('Event created successfully!');
      handleCloseModal();
      fetchEvents();
    } else {
      toast.error(result.error || 'Failed to create event. Please try again.');
      setFormErrors({ submit: result.error || 'Failed to create event' });
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    const submitData = { ...formData };
    if (!submitData.maxTeams) delete submitData.maxTeams;
    
    const result = await updateEvent(selectedEvent._id, submitData);
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success('Event updated successfully!');
      handleCloseModal();
      fetchEvents();
    } else {
      toast.error(result.error || 'Failed to update event. Please try again.');
      setFormErrors({ submit: result.error || 'Failed to update event' });
    }
  };

  const handleDeleteEvent = (event) => {
    setDeleteConfirmation({ 
      show: true, 
      eventId: event._id, 
      eventName: event.name 
    });
  };

  const handleViewQR = async (eventId) => {
    setLoadingQR(true);
    const result = await getEventCanteenQR(eventId);
    
    if (result.success) {
      setQREventData(result.data);
      setShowQRModal(true);
    } else {
      toast.error(result.error);
    }
    setLoadingQR(false);
  };

  const handleConfirmDelete = async () => {
    const { eventId } = deleteConfirmation;
    setIsSubmitting(true);
    
    const result = await deleteEvent(eventId);
    setIsSubmitting(false);
    setDeleteConfirmation({ show: false, eventId: null, eventName: '' });
    
    if (result.success) {
      toast.success('Event deleted successfully!');
      fetchEvents();
    } else {
      toast.error(result.error || 'Failed to delete event. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      hackathon: 'bg-purple-500/20 text-purple-300 border border-purple-500/20',
      sports: 'bg-green-500/20 text-green-300 border border-green-500/20',
      cultural: 'bg-pink-500/20 text-pink-300 border border-pink-500/20',
      technical: 'bg-blue-500/20 text-blue-300 border border-blue-500/20',
      food: 'bg-orange-500/20 text-orange-300 border border-orange-500/20',
    };
    return colors[type] || 'bg-slate-500/20 text-slate-300 border border-slate-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Events Management</h2>
          <p className="text-slate-400 mt-1">Create and manage festival events</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-cyan-500/20"
        >
          <FaPlus />
          Create Event
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          <p className="ml-4 text-slate-400">Loading events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-2 text-red-400 hover:text-red-300 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && events.length === 0 && (
        <div className="glass-card p-12 text-center">
          <FaCalendarAlt className="text-slate-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
          <p className="text-slate-400 mb-4">Create your first event to get started!</p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-cyan-500/20"
          >
            <FaPlus />
            Create Event
          </button>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="glass-card overflow-hidden hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white flex-1 group-hover:text-cyan-400 transition-colors">{event.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <FaCalendarAlt className="text-blue-400" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <FaMapMarkerAlt className="text-red-400" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <FaUsers className="text-green-400" />
                    <span>{event.minTeamSize}-{event.maxTeamSize} members/team</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <FaMoneyBillWave className="text-yellow-400" />
                    <span>₹{event.registrationFeePerMember}/member</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{event.stats?.totalTeamsRegistered || 0}</div>
                    <div className="text-xs text-slate-400">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{event.stats?.totalMembersRegistered || 0}</div>
                    <div className="text-xs text-slate-400">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{event.stats?.totalCheckedIn || 0}</div>
                    <div className="text-xs text-slate-400">Checked In</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                    event.registrationOpen 
                      ? 'bg-green-500/20 text-green-300 border-green-500/20' 
                      : 'bg-slate-500/20 text-slate-300 border-slate-500/20'
                  }`}>
                    {event.registrationOpen ? <FaCheckCircle /> : <FaTimesCircle />}
                    {event.registrationOpen ? 'Open' : 'Closed'}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                    event.isActive 
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/20' 
                      : 'bg-slate-500/20 text-slate-300 border-slate-500/20'
                  }`}>
                    {event.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewQR(event._id)}
                    disabled={loadingQR}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors text-sm font-medium"
                  >
                    <FaQrcode />
                    QR
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(event)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-md w-full p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/20">
                <FaTrash className="text-red-400 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Delete Event</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Are you sure you want to delete <span className="font-semibold text-white">{deleteConfirmation.eventName}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation({ show: false, eventId: null, eventName: '' })}
                className="px-4 py-2 border border-white/10 text-slate-300 rounded-lg hover:bg-white/5 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 shadow-2xl relative animate-zoom-in">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 px-6 py-5 flex items-center justify-between z-20">
              <div>
                 <h3 className="text-xl font-bold text-white tracking-tight">
                  {showCreateModal ? 'Create New Event' : 'Edit Event'}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {showCreateModal ? 'Fill in the details to launch a new event' : 'Update event details and settings'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                disabled={isSubmitting}
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={showCreateModal ? handleCreateEvent : handleUpdateEvent} className="p-6 md:p-8 space-y-6">
              {/* Error Message */}
              {formErrors.submit && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                   <FaTimesCircle className="text-red-400 mt-0.5 shrink-0" />
                   <div>
                      <h4 className="text-sm font-semibold text-red-400">Submission Failed</h4>
                      <p className="text-sm text-red-300/80 mt-0.5">{formErrors.submit}</p>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Event Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. HackFire 2025"
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-slate-600 transition-all ${
                      formErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.name && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><FaTimesCircle/> {formErrors.name}</p>}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase())}
                        placeholder="hackfire-2025"
                        className={`w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-slate-600 transition-all ${
                        formErrors.slug ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                        }`}
                        disabled={isSubmitting}
                    />
                    {isSubmitting && <div className="absolute right-3 top-3.5"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></div>}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">URL-friendly ID (lowercase, hyphens only)</p>
                  {formErrors.slug && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><FaTimesCircle/> {formErrors.slug}</p>}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Event Type</label>
                  <div className="relative">
                    <select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white appearance-none cursor-pointer transition-all"
                        disabled={isSubmitting}
                    >
                        <option value="hackathon" className="bg-slate-900">Hackathon 💻</option>
                        <option value="sports" className="bg-slate-900">Sports ⚽</option>
                        <option value="cultural" className="bg-slate-900">Cultural 🎭</option>
                        <option value="technical" className="bg-slate-900">Technical 🔧</option>
                        <option value="food" className="bg-slate-900">Food 🍔</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    placeholder="Describe the event details..."
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-slate-600 transition-all resize-none ${
                      formErrors.description ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.description && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><FaTimesCircle/> {formErrors.description}</p>}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white scheme-dark transition-all ${
                      formErrors.dates ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white scheme-dark transition-all ${
                      formErrors.dates ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.dates && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><FaTimesCircle/> {formErrors.dates}</p>}
                </div>

                {/* Venue */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Venue <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="e.g. Main Auditorium, Block B"
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-slate-600 transition-all ${
                      formErrors.venue ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.venue && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><FaTimesCircle/> {formErrors.venue}</p>}
                </div>

                {/* Registration Fee */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Reg. Fee (₹) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <input
                        type="number"
                        min="0"
                        value={formData.registrationFeePerMember}
                        onChange={(e) => handleInputChange('registrationFeePerMember', e.target.value)}
                        className={`w-full pl-8 pr-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-slate-600 transition-all ${
                        formErrors.registrationFeePerMember ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                        }`}
                        disabled={isSubmitting}
                    />
                  </div>
                  {formErrors.registrationFeePerMember && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><FaTimesCircle/> {formErrors.registrationFeePerMember}</p>}
                </div>

                {/* Max Teams */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max Teams (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxTeams}
                    onChange={(e) => handleInputChange('maxTeams', e.target.value)}
                    placeholder="Unlimited"
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-slate-600 transition-all ${
                      formErrors.maxTeams ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.maxTeams && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><FaTimesCircle/> {formErrors.maxTeams}</p>}
                </div>

                {/* Min Team Size */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Min Team Size <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minTeamSize}
                    onChange={(e) => handleInputChange('minTeamSize', e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white transition-all ${
                      formErrors.teamSize ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Max Team Size */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max Team Size <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxTeamSize}
                    onChange={(e) => handleInputChange('maxTeamSize', e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white transition-all ${
                      formErrors.teamSize ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-cyan-500/50'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.teamSize && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><FaTimesCircle/> {formErrors.teamSize}</p>}
                </div>

                {/* Toggles */}
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                   {/* Registration Open */}
                    <label className="flex items-center cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={formData.registrationOpen}
                                onChange={(e) => handleInputChange('registrationOpen', e.target.checked)}
                                className="sr-only"
                                disabled={isSubmitting}
                            />
                            <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out border border-transparent ${formData.registrationOpen ? 'bg-green-500/20 border-green-500/50' : 'bg-slate-700 border-white/10'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${formData.registrationOpen ? 'translate-x-5 bg-green-400' : ''}`}></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Registration Open</span>
                    </label>

                    {/* Is Active */}
                    <label className="flex items-center cursor-pointer group">
                         <div className="relative">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                className="sr-only"
                                disabled={isSubmitting}
                            />
                            <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out border border-transparent ${formData.isActive ? 'bg-blue-500/20 border-blue-500/50' : 'bg-slate-700 border-white/10'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${formData.isActive ? 'translate-x-5 bg-blue-400' : ''}`}></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Event Active</span>
                    </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {showCreateModal ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      {showCreateModal ? 'Launch Event' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && qrEventData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative animate-zoom-in">
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 px-6 py-4 flex justify-between items-center z-20">
              <h3 className="text-xl font-bold text-white tracking-tight">Event Canteen QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <FaTimes size={16} />
              </button>
            </div>
            <div className="p-6 md:p-8">
              <EventQRDisplay event={qrEventData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsTab;
