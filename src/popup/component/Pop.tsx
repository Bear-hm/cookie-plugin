import React, { useEffect, useState } from "react";
import { Input, Button, Space, notification, Tooltip } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ImportOutlined,
  ExportOutlined,
  SearchOutlined,
  SaveOutlined,
  // ArrowLeftOutlined,
} from "@ant-design/icons";

interface PopProps {
  onGetAllCookies: () => Promise<chrome.cookies.Cookie[]>;
  onSetCookie: (name: string, value: string) => Promise<void>;
  onDeleteCookie: (name: string) => Promise<void>;
}

const Pop: React.FC<PopProps> = ({
  onSetCookie,
  onDeleteCookie,
  onGetAllCookies,
}) => {
  const [cookies, setCookies] = useState<chrome.cookies.Cookie[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // 获取所有 cookies
  useEffect(() => {
    loadCookies();
  }, [onGetAllCookies]);

  const loadCookies = async () => {
    const allCookies = await onGetAllCookies();
    setCookies(allCookies);
  };

  const [cookieName, setCookieName] = useState("");
  const [cookieValue, setCookieValue] = useState("");
  const [editingCookie, setEditingCookie] =
    useState<chrome.cookies.Cookie | null>(null);

  // 3. 添加处理编辑的函数
  const handleEditCookie = (cookie: chrome.cookies.Cookie) => {
    setEditingCookie(cookie);
    setCookieName(cookie.name);
    setCookieValue(cookie.value);
    setShowAddForm(true);
  };
  const handleSetCookie = async () => {
    if (!cookieName || !cookieValue) {
      notification.warning({ message: "请输入 Cookie 名称和值" });
      return;
    }
    await onSetCookie(cookieName, cookieValue);
  };

  const handleDeleteCookie = async (name: string) => {
    if (!name) {
      notification.warning({ message: "请输入 Cookie 名称" });
      return;
    }
    await onDeleteCookie(name);
    await loadCookies();
    setCookieValue("");
  };
  const [searchText, setSearchText] = useState("");
  // const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Space>
              <Tooltip title="导入">
                <Button icon={<ImportOutlined />} />
              </Tooltip>
              <Tooltip title="导出">
                <Button icon={<ExportOutlined />} />
              </Tooltip>
            </Space>
          </div>

          {/* 搜索框 */}
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="搜索 Cookie"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="mb-4"
          />
        </div>
      </div>

      {/* Cookie 列表 */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow">
          <div className="flex flex-col divide-y divide-gray-200">
            {cookies
              .filter(
                (cookie) =>
                  cookie.name
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                  cookie.value.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((cookie, index) => (
                <div
                  key={index}
                  className="group p-3 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  {/* Cookie 信息 */}
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 truncate max-w-[120px]">
                        {cookie.name}
                      </span>
                      {cookie.secure && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded flex-shrink-0">
                          Secure
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]">
                      {cookie.value}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex-shrink-0 flex items-center space-x-1">
                    <Tooltip title="编辑">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditCookie(cookie)}
                      />
                    </Tooltip>
                    <Tooltip title="删除">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteCookie(cookie.name)}
                      />
                    </Tooltip>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAddForm(true)}
          >
            添加 Cookie
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              // 实现批量删除功能
            }}
          >
            删除全部
          </Button>
        </div>
      </div>

      {/* 添加/编辑表单 Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium mb-4">
              {editingCookie ? "编辑 Cookie" : "添加 Cookie"}
            </h2>
            <Space direction="vertical" className="w-full">
              <Input
                value={cookieName}
                onChange={(e) => setCookieName(e.target.value)}
                placeholder="Cookie 名称"
                disabled={!!editingCookie}
              />
              <Input.TextArea
                value={cookieValue}
                onChange={(e) => setCookieValue(e.target.value)}
                placeholder="Cookie 值"
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCookie(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={async () => {
                    await handleSetCookie();
                    await loadCookies();
                    setShowAddForm(false);
                    setEditingCookie(null);
                  }}
                >
                  保存
                </Button>
              </div>
            </Space>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pop;
