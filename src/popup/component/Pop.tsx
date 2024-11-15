import React, { useCallback, useEffect } from "react";
import {
  Input,
  Button,
  Space,
  notification,
  Tooltip,
  Select,
  DatePicker,
  Dropdown,
} from "antd";
import useCookies from "./useCookies";
import { DeleteFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import Checkbox from "antd/es/checkbox/Checkbox";
import { CookieDetails } from "../type";
import Clipboard from "./Clipboard";

interface PopProps {
  currentUrl: string;
}

const Pop: React.FC<PopProps> = ({ currentUrl }) => {
  const {
    cookies,
    handleGetAllCookies,
    handleDeleteCookie,
    handleDeleteAllCookies,
    handleExportCookies,
    handleImportCookies,
    handleUpdateCookie,
  } = useCookies(currentUrl);
  const [editingCookie, setEditingCookie] =
    React.useState<CookieDetails | null>(null);
  const [cookieName, setCookieName] = React.useState("");
  const [cookieValue, setCookieValue] = React.useState("");
  const [importMode, setImportMode] = React.useState<
    "none" | "clipboard" | "file"
  >("none");

  const onSaveCookie = useCallback(async () => {
    if (!editingCookie || !cookieName || !cookieValue) {
      notification.warning({
        message: "Please enter the cookie name and value",
      });
      return;
    }

    const cookieDetails: CookieDetails = {
      name: cookieName,
      value: cookieValue,
      path: editingCookie.path,
      domain: editingCookie.domain,
      expirationDate: editingCookie.expirationDate,
      httpOnly: editingCookie.httpOnly,
      secure: editingCookie.secure,
      hostOnly: editingCookie.hostOnly,
      session: editingCookie.session,
      sameSite: editingCookie.sameSite,
    };
    await handleUpdateCookie(cookieName, cookieDetails);
    await handleGetAllCookies();
  }, [
    editingCookie,
    cookieName,
    cookieValue,
    handleGetAllCookies,
    handleUpdateCookie,
  ]);

  useEffect(() => {
    handleGetAllCookies();

  }, [handleGetAllCookies]);

  return (
    <div className="flex flex-col" style={{ width: "700px" }}>
      <span className="flex items-center ">
        <h1 className="text-2xl font-bold">Safe Cookie Editor</h1>
        <span className="text-sm text-gray-500 ml-2">V2.1.3</span>
      </span>
      <div className="flex">
        {/* Cookie 列表部分 */}
        <div
          className="w-1/2 p-4"
          style={{ height: "400px", maxHeight: "400px", overflowY: "auto" }}
        >
          {cookies.length > 0 ? (
            <div>
              {cookies.map((cookie, index) => (
                <div
                  key={index}
                  className="group flex justify-between items-center p-2 border-b cursor-pointer hover:bg-gray-200 relative"
                  onClick={() => {
                    setEditingCookie(cookie as CookieDetails);
                    setCookieName(cookie.name);
                    setCookieValue(cookie.value);
                  }}
                >
                  <span>{cookie.name}</span>
                  <div className="absolute right-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button
                      variant="solid"
                      icon={<DeleteFilled />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCookie(cookie.name);
                      }}
                    ></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm flex items-center justify-center h-full">
              <p>No cookies were found.</p>
            </div>
          )}
        </div>
        {/* 表单内容部分 */}
        <div
          className="w-1/2 p-4"
          style={{ height: "400px", maxHeight: "400px" }}
        >
          {importMode === "clipboard" ? (
            <Clipboard
              onCancel={() => setImportMode("none")}
              onImport={async () => {
                await handleImportCookies("clipboard");
                setImportMode("none");
              }}
            />
          ) : editingCookie ? (
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
                    placeholder="Cookie Domain"
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm mr-2">Expires</label>
                  <DatePicker
                    size={"small"}
                    placement={"bottomRight"}
                    showTime
                    value={
                      editingCookie.expirationDate
                        ? dayjs(editingCookie.expirationDate * 1000)
                        : null
                    }
                    onChange={(date) => {
                      setEditingCookie({
                        ...editingCookie,
                        expirationDate: date ? date.unix() : undefined,
                      });
                    }}
                    placeholder="Select an expiration date"
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm mr-2">HttpOnly</label>
                  <Checkbox
                    checked={editingCookie.httpOnly}
                    onChange={(e) => {
                      setEditingCookie({
                        ...editingCookie,
                        httpOnly: e.target.checked,
                      });
                    }}
                  />
                  <label className="text-sm mr-2 ml-4">Secure</label>
                  <Checkbox
                    checked={editingCookie.secure}
                    onChange={(e) => {
                      setEditingCookie({
                        ...editingCookie,
                        secure: e.target.checked,
                      });
                    }}
                  />
                </div>
                <div className="flex items-center">
                  {/* <label className="text-sm mr-2">HostOnly</label>
                  <Checkbox
                    checked={editingCookie.hostOnly}
                    onChange={(e) => {
                      setEditingCookie({
                        ...editingCookie,
                        hostOnly: e.target.checked,
                      });
                    }}
                  /> */}
                  <label className="text-sm mr-2">Session</label>
                  <Checkbox
                    checked={editingCookie.session}
                    onChange={(e) => {
                      setEditingCookie({
                        ...editingCookie,
                        session: e.target.checked,
                      });
                    }}
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm mr-2">Same&nbsp;Site</label>
                  <Select
                    placeholder="Select a SameSite"
                    optionFilterProp="label"
                    value={editingCookie.sameSite || "no_restriction"}
                    onChange={(value) => {
                      setEditingCookie({
                        ...editingCookie,
                        sameSite: value as "no_restriction" | "lax" | "strict",
                      });
                    }}
                    options={[
                      {
                        value: "no_restriction",
                        label: "No_restriction",
                      },
                      {
                        value: "lax",
                        label: "Lax",
                      },
                      {
                        value: "strict",
                        label: "Strict",
                      },
                    ]}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => {
                      setEditingCookie(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="primary" onClick={onSaveCookie}>
                    Save
                  </Button>
                </div>
              </Space>
            </div>
          ) : (
            <div
              className="flex items-center justify-center h-full bg-gray-100"
              style={{ maxHeight: "510px", overflowY: "auto" }}
            >
              <span className="text-gray-500 text-sm">
                Please select a cookie to view details
              </span>
            </div>
          )}
        </div>
      </div>
      {/* 批量操作 */}
      <div className="flex items-center justify-between mt-8">
        <Space>
          {/* <Tooltip title="Add cookie" overlayStyle={{ fontSize: "12px" }}>
            <Button>Add</Button>
          </Tooltip> */}
          <Tooltip
            title="Remove the all cookie"
            overlayStyle={{ fontSize: "12px" }}
          >
            <Button onClick={handleDeleteAllCookies}>Remove</Button>
          </Tooltip>
          <Tooltip
            title="Import cookies from a file or clipboard"
            overlayStyle={{ fontSize: "12px" }}
          >
            <Dropdown
              menu={{
                items: [
                  {
                    key: "clipboard",
                    label: "Import from clipboard",
                    onClick: () => setImportMode("clipboard"),
                  },
                  {
                    key: "file",
                    label: "Import from file",
                    onClick: () => handleImportCookies("file"),
                  },
                ],
              }}
              trigger={["click"]}
            >
              <Button>Import</Button>
            </Dropdown>
          </Tooltip>
          <Tooltip
            title="Export cookies to a file or clipboard"
            overlayStyle={{ fontSize: "12px" }}
          >
            <Dropdown
              menu={{
                items: [
                  {
                    key: "clipboard",
                    label: "Export to clipboard",
                    onClick: () => handleExportCookies("clipboard"),
                  },
                  {
                    key: "file",
                    label: "Export to file",
                    onClick: () => handleExportCookies("file"),
                  },
                ],
              }}
              trigger={["click"]}
            >
              <Button>Export</Button>
            </Dropdown>
          </Tooltip>
        </Space>
      </div>
    </div>
  );
};

export default Pop;
