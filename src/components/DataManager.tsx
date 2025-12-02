import { Trash2, Download, Upload, AlertCircle } from 'lucide-react';
import { RescueRequest } from '../App';

interface DataManagerProps {
  requests: RescueRequest[];
  onClearData: () => void;
  onImportData: (data: RescueRequest[]) => void;
}

export function DataManager({ requests, onClearData, onImportData }: DataManagerProps) {
  const handleExportData = () => {
    const dataStr = JSON.stringify(requests, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hopespot-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (Array.isArray(data)) {
            onImportData(data);
            alert('Data imported successfully!');
          } else {
            alert('Invalid data format');
          }
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      onClearData();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-gray-900">Data Management</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        All data is stored locally in your browser. Export your data regularly to prevent loss.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>

        <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Import Data</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
          />
        </label>

        <button
          onClick={handleClearData}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All Data</span>
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Total Requests:</strong> {requests.length}
        </p>
      </div>
    </div>
  );
}
