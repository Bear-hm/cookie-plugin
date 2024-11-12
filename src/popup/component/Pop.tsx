import React, { useCallback, useEffect, useState } from "react";
import { Input, Button, Space, notification, Radio, Tooltip } from "antd";
import {
  SaveOutlined,
  ImportOutlined,
  ExportOutlined,
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
  const [editingCookie, setEditingCookie] =
    useState<chrome.cookies.Cookie | null>(null);
  const [cookieName, setCookieName] = useState("");
  const [cookieValue, setCookieValue] = useState("");
  const [searchText, setSearchText] = useState("");

  const loadCookies = useCallback(async () => {
    const allCookies = await onGetAllCookies();
    setCookies(allCookies);
  }, [onGetAllCookies]);

  useEffect(() => {
    loadCookies();
  }, [loadCookies]);

  const handleSetCookie = async () => {
    if (!cookieName || !cookieValue) {
      notification.warning({ message: "请输入 Cookie 名称和值" });
      return;
    }
    await onSetCookie(cookieName, cookieValue);
    await loadCookies();
    setShowAddForm(false);
    setEditingCookie(null);
  };

  const handleDeleteCookie = async (name: string) => {
    if (!name) {
      notification.warning({ message: "请输入 Cookie 名称" });
      return;
    }
    await onDeleteCookie(name);
    await loadCookies();
  };

  return (
    <div className="flex flex-col"  style={{ width: '700px' }}>
      <span className="flex items-center">
        <h1>Safe Cookie Editor</h1>
        <span className="text-sm text-gray-500 ml-2">V1.0.0</span>
      </span>
      <div className="flex">
        {/* Cookie 列表部分 */}
        <div
          className="w-1/2 p-4"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          <div>
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
                  className="flex justify-between items-center p-2 border-b cursor-pointer"
                  onClick={() => {
                    setEditingCookie(cookie);
                    setCookieName(cookie.name);
                    setCookieValue(cookie.value);
                    setShowAddForm(true);
                  }}
                >
                  <span>{cookie.name}</span>
                </div>
              ))}
          </div>
        </div>

        {/* 表单内容部分 */}
        <div
          className="w-1/2 p-4"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {editingCookie ? ( // 检查是否有选中的 Cookie
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-medium mb-4">编辑 Cookie</h2>
              <Space direction="vertical" className="w-full">
                <label>Cookie Name:</label>
                <Input
                  value={cookieName}
                  onChange={(e) => setCookieName(e.target.value)}
                  placeholder="Cookie 名称"
                />
                <label>Cookie Value:</label>
                <Input
                  value={cookieValue}
                  onChange={(e) => setCookieValue(e.target.value)}
                  placeholder="Cookie 值"
                />
                <label>Path:</label>
                <Input
                  value={editingCookie.path}
                  onChange={(e) => (editingCookie.path = e.target.value)} // 直接修改路径
                  placeholder="Cookie 路径"
                />
                <label>Domain:</label>
                <Input
                  value={editingCookie.domain}
                  onChange={(e) => (editingCookie.domain = e.target.value)} // 直接修改域名
                  placeholder="Cookie 域名"
                />
                <label>Expiration Date:</label>
                <Input
                  value={
                    editingCookie.expirationDate
                      ? new Date(
                          editingCookie.expirationDate * 1000
                        ).toLocaleString()
                      : ""
                  }
                  onChange={(e) =>
                    (editingCookie.expirationDate =
                      new Date(e.target.value).getTime() / 1000)
                  } // 直接修改过期时间
                  placeholder="Cookie 过期时间"
                />
                <div className="flex items-center">
                  <label>HttpOnly:</label>
                  <Radio.Group
                    value={editingCookie.httpOnly ? "yes" : "no"}
                    onChange={(e) =>
                      (editingCookie.httpOnly = e.target.value === "yes")
                    }
                  >
                    <Radio value="yes">Yes</Radio>
                    <Radio value="no">No</Radio>
                  </Radio.Group>
                </div>
                <div className="flex items-center">
                  <label>Secure:</label>
                  <Radio.Group
                    value={editingCookie.secure ? "yes" : "no"}
                    onChange={(e) =>
                      (editingCookie.secure = e.target.value === "yes")
                    }
                  >
                    <Radio value="yes">Yes</Radio>
                    <Radio value="no">No</Radio>
                  </Radio.Group>
                </div>
                <label>SameSite:</label>
                <Input
                  value={editingCookie.sameSite}
                  onChange={(e) => (editingCookie.sameSite = e.target.value)} // 直接修改 SameSite 属性
                  placeholder="SameSite 属性"
                />
                <label>Size:</label>
                <Input
                  value={editingCookie.size} // 显示 Cookie 大小
                  disabled // 大小通常不可修改
                  placeholder="Cookie 大小"
                />
                <label>Priority:</label>
                <Input
                  value={editingCookie.priority} // 显示 Cookie 优先级
                  onChange={(e) => (editingCookie.priority = e.target.value)} // 直接修改优先级
                  placeholder="Cookie 优先级"
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
                    onClick={handleSetCookie}
                  >
                    保存
                  </Button>
                </div>
              </Space>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <span className="text-gray-500">
                请选择一个 Cookie 以查看详细信息
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <Space>
          <Button>Remove</Button>
          <Button>Import</Button>
          <Button>Export</Button>
        </Space>
      </div>
    </div>
  );
};

export default Pop;
