import { FaDownload, FaPrint, FaQrcode, FaCheckCircle } from 'react-icons/fa';

const EventQRInstructions = () => {
  const steps = [
    {
      icon: <FaDownload className="text-3xl text-blue-600" />,
      title: 'Download',
      description: 'Click the Download button to save the QR code as an image file',
    },
    {
      icon: <FaPrint className="text-3xl text-purple-600" />,
      title: 'Print',
      description: 'Print the QR code on A4 paper or larger for better visibility',
    },
    {
      icon: <FaQrcode className="text-3xl text-green-600" />,
      title: 'Display',
      description: 'Place the printed QR code at the canteen entrance where participants can easily scan it',
    },
    {
      icon: <FaCheckCircle className="text-3xl text-orange-600" />,
      title: 'Verify',
      description: 'Participants scan the QR, enter their details, and see eligibility status instantly',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        How to Use Event Canteen QR Codes
      </h2>
      
      <p className="text-gray-600 text-center mb-8">
        Follow these simple steps to set up food eligibility verification at your event
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-shrink-0 mt-1">
              {step.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Step {index + 1}: {step.title}
              </h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Each event has a unique canteen QR code</li>
          <li>Only checked-in participants will be marked as eligible for food</li>
          <li>The QR code should be displayed at a height easily accessible for scanning</li>
          <li>Keep the QR code clean and undamaged for reliable scanning</li>
          <li>One QR code per event is sufficient for all canteen stations</li>
        </ul>
      </div>
    </div>
  );
};

export default EventQRInstructions;
