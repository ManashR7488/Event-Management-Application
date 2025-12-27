import { FaCog, FaEnvelope, FaMoneyBillWave, FaShieldAlt, FaServer, FaClock } from 'react-icons/fa';

const PlatformSettingsTab = () => {
  const settingsSections = [
    {
      icon: <FaServer className="text-blue-500 text-2xl" />,
      title: 'General Settings',
      description: 'Configure system-wide settings and preferences',
      status: 'Coming Soon'
    },
    {
      icon: <FaEnvelope className="text-green-500 text-2xl" />,
      title: 'Email Configuration',
      description: 'Set up email templates and SMTP settings',
      status: 'Coming Soon'
    },
    {
      icon: <FaMoneyBillWave className="text-yellow-500 text-2xl" />,
      title: 'Payment Settings',
      description: 'Configure payment gateway and transaction settings',
      status: 'Coming Soon'
    },
    {
      icon: <FaShieldAlt className="text-red-500 text-2xl" />,
      title: 'Security Settings',
      description: 'Manage security policies and authentication options',
      status: 'Coming Soon'
    },
    {
      icon: <FaClock className="text-purple-500 text-2xl" />,
      title: 'Backup & Restore',
      description: 'Schedule backups and restore system data',
      status: 'Coming Soon'
    },
    {
      icon: <FaCog className="text-gray-500 text-2xl" />,
      title: 'Advanced Settings',
      description: 'Configure advanced system parameters',
      status: 'Coming Soon'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Platform Settings</h2>
        <p className="text-gray-600 mt-1">Configure system-wide settings</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FaCog className="text-blue-600 text-xl mt-0.5" />
          <div>
            <h3 className="text-blue-800 font-semibold">Settings Under Development</h3>
            <p className="text-blue-700 text-sm mt-1">
              Platform settings features are currently under development. These options will be available in future updates.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                {section.icon}
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                {section.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{section.title}</h3>
            <p className="text-sm text-gray-600">{section.description}</p>
          </div>
        ))}
      </div>

      {/* Future Features Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Planned Features</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-gray-800 font-medium">Email Template Editor</p>
              <p className="text-sm text-gray-600">Customize email notifications and templates</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-gray-800 font-medium">Payment Gateway Integration</p>
              <p className="text-sm text-gray-600">Configure Razorpay, Stripe, or other payment providers</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-gray-800 font-medium">Automated Backups</p>
              <p className="text-sm text-gray-600">Schedule automatic database backups</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-gray-800 font-medium">Role Permissions Management</p>
              <p className="text-sm text-gray-600">Fine-grained control over user permissions</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-gray-800 font-medium">System Logs & Audit Trail</p>
              <p className="text-sm text-gray-600">Track all system activities and changes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-gray-800 font-medium">Multi-tenancy Support</p>
              <p className="text-sm text-gray-600">Support multiple organizations on one platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Need Custom Settings?</h3>
        <p className="text-gray-600 mb-4">
          If you need specific settings or configurations for your organization, please contact our support team.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default PlatformSettingsTab;
