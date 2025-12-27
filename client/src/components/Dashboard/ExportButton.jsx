import { FaDownload } from 'react-icons/fa';

const ExportButton = ({ onExport, isLoading, label = 'Export CSV', icon }) => {
  return (
    <button
      onClick={onExport}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          Exporting...
        </>
      ) : (
        <>
          {icon || <FaDownload />}
          {label}
        </>
      )}
    </button>
  );
};

export default ExportButton;
