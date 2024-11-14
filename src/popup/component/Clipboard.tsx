import React,{useState} from 'react';
import { Input, Space, Button, notification } from 'antd';

interface ClipboardProps {
  onCancel: () => void;
  onImport: (cookies: chrome.cookies.Cookie[]) => Promise<void>;
}

const Clipboard: React.FC<ClipboardProps> = ({ onCancel, onImport }) => {
  const [clipboardContent, setClipboardContent] = useState('');

  const handleImport = async () => {
    try {
      const cookies = JSON.parse(clipboardContent) as chrome.cookies.Cookie[];
      await onImport(cookies);
      setClipboardContent('');
    } catch (error) {
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
          <Button onClick={onCancel}>
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
export default Clipboard;