import { Database, Tag, Clock, User } from 'lucide-react';

interface MetadataDisplayProps {
  data: {
    dataType?: string;
    submissionSource?: string;
    createdBy?: string;
    createdByPhone?: string;
    lastModified?: string;
    modifiedBy?: string;
    accountSource?: string;
    createdAt?: string;
  };
  compact?: boolean;
}

export function MetadataDisplay({ data, compact = false }: MetadataDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {data.dataType && (
          <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
            <Database className="w-3 h-3" />
            {data.dataType}
          </span>
        )}
        {data.lastModified && (
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Modified: {new Date(data.lastModified).toLocaleString()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-4 h-4 text-gray-600" />
        <h4 className="text-sm font-semibold text-gray-700">Data Metadata</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        {data.dataType && (
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Type
            </p>
            <p className="text-gray-900 font-medium">{data.dataType}</p>
          </div>
        )}
        
        {data.submissionSource && (
          <div>
            <p className="text-gray-500">Source</p>
            <p className="text-gray-900 font-medium">{data.submissionSource}</p>
          </div>
        )}
        
        {data.accountSource && (
          <div>
            <p className="text-gray-500">Account Source</p>
            <p className="text-gray-900 font-medium">{data.accountSource}</p>
          </div>
        )}
        
        {data.createdBy && (
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <User className="w-3 h-3" />
              Created By
            </p>
            <p className="text-gray-900 font-medium">{data.createdBy}</p>
          </div>
        )}
        
        {data.createdByPhone && (
          <div>
            <p className="text-gray-500">Creator Phone</p>
            <p className="text-gray-900 font-medium">{data.createdByPhone}</p>
          </div>
        )}
        
        {data.lastModified && (
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last Modified
            </p>
            <p className="text-gray-900 font-medium text-xs">
              {new Date(data.lastModified).toLocaleString()}
            </p>
          </div>
        )}
        
        {data.modifiedBy && (
          <div>
            <p className="text-gray-500">Modified By</p>
            <p className="text-gray-900 font-medium">{data.modifiedBy}</p>
          </div>
        )}
        
        {data.createdAt && (
          <div>
            <p className="text-gray-500">Created At</p>
            <p className="text-gray-900 font-medium text-xs">
              {new Date(data.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
