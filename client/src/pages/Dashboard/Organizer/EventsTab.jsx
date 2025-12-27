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
      hackathon: 'bg-purple-100 text-purple-800',
      sports: 'bg-green-100 text-green-800',
      cultural: 'bg-pink-100 text-pink-800',
      technical: 'bg-blue-100 text-blue-800',
      food: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Events Management</h2>
          <p className="text-gray-600 mt-1">Create and manage festival events</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          Create Event
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && events.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaCalendarAlt className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">Create your first event to get started!</p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            <div key={event._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex-1">{event.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendarAlt className="text-blue-500" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaMapMarkerAlt className="text-red-500" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaUsers className="text-green-500" />
                    <span>{event.minTeamSize}-{event.maxTeamSize} members/team</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaMoneyBillWave className="text-yellow-500" />
                    <span>₹{event.registrationFeePerMember}/member</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{event.stats?.totalTeams || 0}</div>
                    <div className="text-xs text-gray-600">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{event.stats?.totalMembers || 0}</div>
                    <div className="text-xs text-gray-600">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{event.stats?.checkedIn || 0}</div>
                    <div className="text-xs text-gray-600">Checked In</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    event.registrationOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.registrationOpen ? <FaCheckCircle /> : <FaTimesCircle />}
                    {event.registrationOpen ? 'Open' : 'Closed'}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    event.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <FaQrcode />
                    QR
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(event)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">Delete Event</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete <span className="font-semibold">{deleteConfirmation.eventName}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation({ show: false, eventId: null, eventName: '' })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {showCreateModal ? 'Create New Event' : 'Edit Event'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={showCreateModal ? handleCreateEvent : handleUpdateEvent} className="p-6">
              {/* Error Message */}
              {formErrors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {formErrors.submit}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase())}
                    placeholder="url-friendly-identifier"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.slug ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-xs text-gray-500">Lowercase, alphanumeric, and hyphens only</p>
                  {formErrors.slug && <p className="mt-1 text-sm text-red-600">{formErrors.slug}</p>}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="technical">Technical</option>
                    <option value="food">Food</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.dates ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.dates ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.dates && <p className="mt-1 text-sm text-red-600">{formErrors.dates}</p>}
                </div>

                {/* Venue */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.venue ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.venue && <p className="mt-1 text-sm text-red-600">{formErrors.venue}</p>}
                </div>

                {/* Registration Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Fee per Member <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.registrationFeePerMember}
                    onChange={(e) => handleInputChange('registrationFeePerMember', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.registrationFeePerMember ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.registrationFeePerMember && <p className="mt-1 text-sm text-red-600">{formErrors.registrationFeePerMember}</p>}
                </div>

                {/* Max Teams */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Teams (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxTeams}
                    onChange={(e) => handleInputChange('maxTeams', e.target.value)}
                    placeholder="No limit"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.maxTeams ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.maxTeams && <p className="mt-1 text-sm text-red-600">{formErrors.maxTeams}</p>}
                </div>

                {/* Min Team Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Team Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minTeamSize}
                    onChange={(e) => handleInputChange('minTeamSize', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.teamSize ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Max Team Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Team Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxTeamSize}
                    onChange={(e) => handleInputChange('maxTeamSize', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.teamSize ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formErrors.teamSize && <p className="mt-1 text-sm text-red-600">{formErrors.teamSize}</p>}
                </div>

                {/* Registration Open */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="registrationOpen"
                    checked={formData.registrationOpen}
                    onChange={(e) => handleInputChange('registrationOpen', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="registrationOpen" className="ml-2 text-sm font-medium text-gray-700">
                    Registration Open
                  </label>
                </div>

                {/* Is Active */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                    Is Active
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {showCreateModal ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      {showCreateModal ? 'Create Event' : 'Update Event'}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Event Canteen QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <EventQRDisplay event={qrEventData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsTab;
