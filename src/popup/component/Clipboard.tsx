import React,{useState} from 'react';
import { Input, Space, Button, notification } from 'antd';
interface ClipboardProps {
  onCancel: () => void;
  onImport: (cookies) => Promise<void>;
}

const Clipboard: React.FC<ClipboardProps> = ({ onCancel, onImport }) => {
  const [clipboardContent, setClipboardContent] = useState('');
  const handleImport = async () => {
    try {
      const cookies = JSON.parse(clipboardContent);
      console.log("导入的cookies格式", cookies);
      if (!Array.isArray(cookies)) {
        notification.error({
          message: 'Import Error',
          description: 'Invalid JSON format'
        });
      }
      await onImport(cookies); 
      setClipboardContent('');
    } catch (error) {
      notification.error({
        message: 'In Clipboard Import Error',
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
          placeholder={`Enter JSON format like: [
{
  "domain": "localhost",
  "expirationDate": 1764317095.490557,
  "hostOnly": true,
  "httpOnly": false,
  "name": "_ga",
  "path": "/",
  ...
},
{
  "domain": "example.com",
  "expirationDate": 1764317095.490557,
  "hostOnly": true,
  ...
}
]`}
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