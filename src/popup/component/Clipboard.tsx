import React from 'react';
import { Input, Space, Button, notification } from 'antd';

interface ClipboardImportProps {
  onCancel: () => void;
  onImport: (cookies: chrome.cookies.Cookie[]) => void;
}

const ClipboardImport: React.FC<ClipboardImportProps> = ({ onCancel, onImport }) => {
  const [clipboardContent, setClipboardContent] = React.useState('');

  const handleImport = () => {
    try {
      const cookies = JSON.parse(clipboardContent);
      onImport(cookies);
      setClipboardContent('');
    } catch (error: unknown) {
      notification.error({
        message: 'Import Error',
        description: 'Invalid JSON format'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-sm text-gray-500 mb-2">
        Paste your cookie JSON data here
      </h2>
      <Space direction="vertical" className="w-full">
        <Input.TextArea
          value={clipboardContent}
          onChange={(e) => setClipboardContent(e.target.value)}
          placeholder="Paste cookie JSON here..."
          rows={10}
        />
        <div className="flex justify-end space-x-2">
          <Button 
            onClick={() => {
              onCancel();
              setClipboardContent('');
            }}
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleImport}
          >
            Import
          </Button>
        </div>
      </Space>
    </div>
  );
};

export default ClipboardImport;