import React, { useCallback, useEffect, useState } from "react";
import {
  Input,
  Button,
  Space,
  notification,
  Radio,
  Tooltip,
  Select,
  DatePicker,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { getAllCookies, setCookie, deleteCookie } from "../index";
import dayjs from "dayjs";
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
    <div className="flex flex-col" style={{ width: "700px" }}>
      <span className="flex items-center">
        <h1>Safe Cookie Editor</h1>
        <span className="text-sm text-gray-500 ml-2">V1.0.0</span>
      </span>
      <div className="flex">
        {/* Cookie 列表部分 */}
        <div
          className="w-1/2 p-4"
          style={{ maxHeight: "510px", overflowY: "auto" }}
        >
          {cookies.length > 0 ? (
            <div>
              {cookies
                .filter(
                  (cookie) =>
                    cookie.name
                      .toLowerCase()
                      .includes(searchText.toLowerCase()) ||
                    cookie.value
                      .toLowerCase()
                      .includes(searchText.toLowerCase())
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
          ) : (
            <div className="text-gray-500 text-center">
              <p>没有找到任何 Cookie。</p>
              <p>请添加新的 Cookie 或检查搜索条件。</p>
            </div>
          )}
        </div>

        {/* 表单内容部分 */}
        <div
          className="w-1/2 p-4"
          style={{ maxHeight: "510px", overflowY: "auto" }}
        >
          {editingCookie ? (
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-sm text-gray-500 mb-2">
                Click on the cookie on the left to edit it.
              </h2>
              <Space direction="vertical" className="w-full">
                <div className="flex item-center">
                  <label className="text-sm mr-2">Name</label>
                  <Input
                    value={cookieName}
                    onChange={(e) => setCookieName(e.target.value)}
                    placeholder="Cookie Name"
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm mr-2">Value</label>
                  <Input
                    value={cookieValue}
                    onChange={(e) => setCookieValue(e.target.value)}
                    placeholder="Cookie Value"
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm mr-2">Path</label>
                  <Input value={editingCookie.path} placeholder="Cookie Path" />
                </div>
                <div className="flex items-center">
                  <label className="text-sm mr-2">Domain</label>
                  <Input
                    disabled
                    value={editingCookie.domain}
                    onChange={(e) => (editingCookie.domain = e.target.value)} // 直接修改域名
                    placeholder="Cookie Domain"
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm mr-2">Expires</label>
                  <DatePicker
                    showTime
                    value={
                      editingCookie.expirationDate
                        ? dayjs(editingCookie.expirationDate * 1000)
                        : null
                    }
                    onChange={(date) => {
                      if (date) {
                        editingCookie.expirationDate = date.unix();
                      } else {
                        editingCookie.expirationDate = undefined;
                      }
                    }}
                    placeholder="选择过期时间"
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm mr-2">HttpOnly</label>
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
                  <label className="text-sm mr-2">Secure</label>
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
                <div className="flex items-center">
                  <label className="text-sm mr-2">Same&nbsp;Site</label>
                  <Select
                    placeholder="Select a SameSite"
                    optionFilterProp="label"
                    options={[
                      {
                        value: "None",
                        label: "None",
                      },
                      {
                        value: "Lax",
                        label: "Lax",
                      },
                      {
                        value: "Strict",
                        label: "Strict",
                      },
                    ]}
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm mr-2">Size</label>
                  <Input
                    value={editingCookie.size}
                    disabled
                    placeholder="Cookie size"
                  />
                  <label className="text-sm mr-2 ml-4">Priority</label>
                  <Input
                    value={editingCookie.priority} // 显示 Cookie 优先级
                    onChange={(e) => (editingCookie.priority = e.target.value)} // 直接修改优先级
                    placeholder="Cookie priority"
                  />
                </div>

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
            <div
              className="flex items-center justify-center h-full bg-gray-100"
              style={{ maxHeight: "510px", overflowY: "auto" }}
            >
              <span className="text-gray-500">
                请选择一个 Cookie 以查看详细信息
              </span>
            </div>
          )}
        </div>
      </div>
      {/* 批量操作 */}
      <div className="flex items-center justify-between mb-4">
        <Space>
          <Tooltip
            title="Remove the all cookie"
            overlayStyle={{ fontSize: "12px" }}
          >
            <Button>Remove</Button>
          </Tooltip>
          <Tooltip
            title="Import cookies from a file or clipboard"
            overlayStyle={{ fontSize: "12px" }}
          >
            <Button>Import</Button>
          </Tooltip>
          <Tooltip
            title="Export cookies to a file or clipboard"
            overlayStyle={{ fontSize: "12px" }}
          >
            <Button>Export</Button>
          </Tooltip>
        </Space>
      </div>
    </div>
  );
};

export default Pop;
