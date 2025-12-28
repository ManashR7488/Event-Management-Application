import { FaCog, FaEnvelope, FaMoneyBillWave, FaShieldAlt, FaServer, FaClock } from 'react-icons/fa';

const PlatformSettingsTab = () => {
  const settingsSections = [
    {
      icon: <FaServer className="text-blue-400 text-2xl" />,
      title: 'General Settings',
      description: 'Configure system-wide settings and preferences',
      status: 'Coming Soon'
    },
    {
      icon: <FaEnvelope className="text-green-400 text-2xl" />,
      title: 'Email Configuration',
      description: 'Set up email templates and SMTP settings',
      status: 'Coming Soon'
    },
    {
      icon: <FaMoneyBillWave className="text-yellow-400 text-2xl" />,
      title: 'Payment Settings',
      description: 'Configure payment gateway and transaction settings',
      status: 'Coming Soon'
    },
    {
      icon: <FaShieldAlt className="text-red-400 text-2xl" />,
      title: 'Security Settings',
      description: 'Manage security policies and authentication options',
      status: 'Coming Soon'
    },
    {
      icon: <FaClock className="text-purple-400 text-2xl" />,
      title: 'Backup & Restore',
      description: 'Schedule backups and restore system data',
      status: 'Coming Soon'
    },
    {
      icon: <FaCog className="text-slate-400 text-2xl" />,
      title: 'Advanced Settings',
      description: 'Configure advanced system parameters',
      status: 'Coming Soon'
    }
  ];

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Platform Settings</h2>
        <p className="text-slate-400 mt-1">Configure system-wide settings</p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-xl p-4 shimmer">
        <div className="flex items-start gap-3">
          <FaCog className="text-cyan-400 text-xl mt-0.5 animate-spin-slow" />
          <div>
            <h3 className="text-cyan-300 font-semibold">Settings Under Development</h3>
            <p className="text-cyan-200/80 text-sm mt-1">
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
            className="glass-card rounded-xl border border-white/10 p-6 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                {section.icon}
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 rounded-full">
                {section.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">{section.title}</h3>
            <p className="text-sm text-slate-400">{section.description}</p>
          </div>
        ))}
      </div>

      {/* Future Features Section */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Planned Features</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            <div>
              <p className="text-slate-200 font-medium">Email Template Editor</p>
              <p className="text-sm text-slate-400">Customize email notifications and templates</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
            <div>
              <p className="text-slate-200 font-medium">Payment Gateway Integration</p>
              <p className="text-sm text-slate-400">Configure Razorpay, Stripe, or other payment providers</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
            <div>
              <p className="text-slate-200 font-medium">Automated Backups</p>
              <p className="text-sm text-slate-400">Schedule automatic database backups</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
            <div>
              <p className="text-slate-200 font-medium">Role Permissions Management</p>
              <p className="text-sm text-slate-400">Fine-grained control over user permissions</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
            <div>
              <p className="text-slate-200 font-medium">System Logs & Audit Trail</p>
              <p className="text-sm text-slate-400">Track all system activities and changes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>
            <div>
              <p className="text-slate-200 font-medium">Multi-tenancy Support</p>
              <p className="text-sm text-slate-400">Support multiple organizations on one platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl border border-blue-500/20 p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white mb-2">Need Custom Settings?</h3>
          <p className="text-slate-300 mb-4 max-w-2xl">
            If you need specific settings or configurations for your organization, please contact our support team.
          </p>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
            Contact Support
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
      </div>
    </div>
  );
};

export default PlatformSettingsTab;
