import React, { useCallback, useEffect, useRef,useState } from "react";
import {
  Input,
  Button,
  Space,
  notification,
  Tooltip,
  Select,
  DatePicker,
  Dropdown,
  Modal,
} from "antd";
import useCookies from "./useCookies";
import dayjs from "dayjs";
import Checkbox from "antd/es/checkbox/Checkbox";
import Clipboard from "./Clipboard";
// 图片/图标
import bgImg from "../../assets/f-bg.png";
import cancel from "../../assets/svg/cancel.svg";
import update from "../../assets/svg/update.svg";
import deleteicon from "../../assets/svg/delete-white.svg";
import deletered from "../../assets/svg/delete-red.svg";
import exportico from "../../assets/svg/export.svg";
import importico from "../../assets/svg/import.svg";
import TextArea from "antd/es/input/TextArea";
import { useHover } from "ahooks";
interface PopProps {
  currentUrl: string;
}
interface CookieMessage {
  type: "cookiesChanged";
}

const Pop: React.FC<PopProps> = ({ currentUrl }) => {
  // 自定义
  const {
    cookies,
    handleGetAllCookies,
    handleDeleteCookie,
    handleDeleteAllCookies,
    handleExportCookies,
    handleImportCookies,
    handleUpdateCookie,
  } = useCookies(currentUrl);
// 控制下拉和hover框不要重叠
  const tooltipRef = useRef(null)
  const isHovering = useHover(tooltipRef)
  const exportRef = useRef(null)
  const isExportHover = useHover(exportRef)

  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isDropOpen, setIsDropOpen] = useState(false)
  const [editingCookie, setEditingCookie] =
    React.useState<chrome.cookies.Cookie | null>(null);
  const [importMode, setImportMode] = React.useState<
    "none" | "clipboard" | "file"
  >("none");

  // 选中
  const [selectedCookieName, setSelectedCookieName] = React.useState<
    string | null
  >(null);
  // 保留原始name值(修改)
  const [originalCookieName, setOriginalCookieName] =
    React.useState<string>("");
  //保存更改
  const onSaveCookie = useCallback(async () => {
    if (!editingCookie || !editingCookie.name || !editingCookie.value) {
      notification.warning({
        message: "Please enter the cookie name and value",
        duration: 3,
        placement: "top",
      });
      return;
    }
    const cookieDetails: chrome.cookies.Cookie = {
      name: editingCookie.name,
      value: editingCookie.value,
      path: editingCookie.path,
      domain: editingCookie.domain,
      expirationDate: editingCookie.expirationDate,
      httpOnly: editingCookie.httpOnly,
      secure: editingCookie.secure,
      hostOnly: editingCookie.hostOnly,
      session: editingCookie.session,
      sameSite: editingCookie.sameSite,
      storeId: editingCookie.storeId,
    };
    try {
      await handleUpdateCookie(originalCookieName, cookieDetails);
      setOriginalCookieName(editingCookie.name);
    } catch (error) {
      console.error("Failed to update cookie:", error);
    }
  }, [editingCookie, handleUpdateCookie, originalCookieName]);

  useEffect(() => {
    handleGetAllCookies();
    // 监听变化
    if (chrome?.runtime?.onMessage) {
      // 监听变化
      const cookieChangeListener = (message: CookieMessage) => {
        if (message.type === "cookiesChanged") {
          handleGetAllCookies();
        }
      };
      chrome.runtime.onMessage.addListener(cookieChangeListener);
      return () => {
        chrome.runtime.onMessage.removeListener(cookieChangeListener);
      };
    }
  }, [currentUrl, handleGetAllCookies]);
  return (
    <div
      className="flex flex-col py-4"
      style={{
        width: "740px",
        backgroundColor: "#FAF3E9",
        color: "#381A1A",
        paddingLeft: "18px",
        paddingRight: "0",
      }}
    >
      <span className="flex items-end mb-3">
        <h1 className="text-2xl font-bold">Cookie Editor - Cookie Manager</h1>
        <span className="text-sm text-gray-500 ml-3">V2.1.3</span>
      </span>
      <div className="flex " style={{ backgroundColor: "#FAF3E9" }}>
        {/* Cookie 列表部分 */}
        <div
          className="w-1/2 pt-6 px-6 bg-white rounded-lg"
          style={{ overflowY: "auto", height: "455px" }}
        >
          {cookies.length > 0 ? (
            <div>
              {cookies.map((cookie, index) => (
                <div
                  key={index}
                  className={`group flex justify-between items-center p-2 border-b cursor-pointer relative `}
                  style={{
                    backgroundColor:
                    selectedCookieName === cookie.name ? "#FAF3E9" : "",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FAF3E9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                    selectedCookieName === cookie.name ? "#FAF3E9" : "";
                  }}
                  onClick={() => {
                    setEditingCookie(cookie as chrome.cookies.Cookie);
                    setSelectedCookieName(cookie.name);
                    setImportMode("none");
                    setOriginalCookieName(cookie.name);
                  }}
                >
                  <span className="text-sm">{cookie.name}</span>
                  <div className="absolute right-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button
                      style={{ padding: 0, border: "none", background: "none" }}
                      icon={
                        <img
                          src={deletered}
                          alt="deleteIcon"
                          style={{ width: "16px", height: "16px" }}
                        />
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        Modal.confirm({
                          title: 'Confirm Actioin',
                          content: `This action is irreversible. Are you sure you want to remove this？`,
                          centered: true,
                          okButtonProps: { style: { backgroundColor: '#381A1A', color: '#fff' } }, 
                          cancelButtonProps: { style: { backgroundColor: '#6F6F6F', color: '#fff' } }, 
                          onOk: () => {
                            handleDeleteCookie(cookie.name);
                            setEditingCookie(null);
                            setSelectedCookieName(null);
                          },
                        });
                      }}
                    ></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex items-center justify-center h-full"
              style={{ fontSize: "24px", fontWeight: 700, padding: "8px" }}
            >
              <p>There are no cookies for the current page. </p>
            </div>
          )}
        </div>
        {/* 表单内容部分 */}
        <div
          className="w-1/2 rounded-lg"
          style={{ backgroundColor: "#FAF3E9", height: "455px" }}
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
            <div className="rounded-lg w-full max-w-md p-4">
              <Space direction="vertical" className="w-full">
                <div className="flex flex-col mt-2">
                  <label className="text-sm mr-2">
                    <span className="text-red-500">*</span>Name
                  </label>
                  <TextArea
                    value={editingCookie.name}
                    onChange={(e) => {
                      setEditingCookie({
                        ...editingCookie,
                        name: e.target.value,
                      });
                    }}
                    placeholder="Cookie Name"
                    autoSize={{ minRows: 2, maxRows: 6 }} 
                  />
                </div>
                <div className="flex flex-col mt-2">
                  <label className="text-sm mr-2">
                    <span className="text-red-500">*</span>Value
                  </label>
                  <Input
                    value={editingCookie.value}
                    onChange={(e) => {
                      setEditingCookie({
                        ...editingCookie,
                        value: e.target.value,
                      });
                    }}
                    placeholder="Cookie Value"
                  />
                </div>
                <div className="flex flex-col mt-2">
                  <label className="text-sm mr-2">Domain</label>
                  <Input
                    disabled
                    value={editingCookie.domain}
                    onChange={(e) => {
                      setEditingCookie({
                        ...editingCookie,
                        domain: e.target.value,
                      });
                    }}
                    placeholder="Cookie Domain"
                  />
                </div>
                <div className="flex flex-col mt-2">
                  <label className="text-sm mr-2">Path</label>
                  <Input
                    value={editingCookie.path}
                    placeholder="Cookie Path"
                    onChange={(e) => {
                      setEditingCookie({
                        ...editingCookie,
                        path: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="flex flex-col mt-2">
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
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf('day');
                    }}
                    placeholder="Select an expiration date"
                  />
                </div>
                <div className="flex flex-col mt-2">
                  <label className="text-sm mr-2">Same&nbsp;Site</label>
                  <Select
                    popupMatchSelectWidth={false}
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
                        value: "none",
                        label: "None",
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
                {/* <div className="">
                  <label className="text-sm mr-2">HostOnly</label>
                  <Checkbox
                    checked={editingCookie.hostOnly}
                    onChange={(e) => {
                      setEditingCookie({
                        ...editingCookie,
                        hostOnly: e.target.checked,
                      });
                    }}
                  />
                  <label className="text-sm mr-2 ml-4">Session</label>
                  <Checkbox
                    checked={editingCookie.session}
                    onChange={(e) => {
                      setEditingCookie({
                        ...editingCookie,
                        session: e.target.checked,
                      });
                    }}
                  />
                </div> */}
                <div className="">
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
              </Space>
            </div>
          ) : (
            <div
              className="flex items-center justify-center h-full bg-cover bg-center relative rounded-lg"
              style={{ backgroundImage: `url(${bgImg})`, padding: "15px" }}
            >
              <span className="font-extrabold" style={{ fontSize: "32px" }}>
                Click on the cookie on the left to edit it.
              </span>
            </div>
          )}
        </div>
      </div>
      {/* 批量操作 */}
      <div className="flex items-center justify-between mt-5 mr-3">
        <Space>
          <Tooltip
            title="Remove cookie"
            overlayInnerStyle={{
              fontSize: "14px",
              backgroundColor: "#FFFFFF",
              color: "#381A1A",
            }}
            arrow={false}
            destroyTooltipOnHide={false}
          >
            <Button
              onClick={() => {
                handleDeleteAllCookies();
                setEditingCookie(null);
                setSelectedCookieName(null);
              }}
              style={{ backgroundColor: "#EF4444", color: "#fff" ,opacity: cookies.length ? 1 : 0.5}}
              disabled={!cookies.length}
              icon={
                <img
                  src={deleteicon}
                  alt="deleteIcon"
                  style={{ width: "16px", height: "16px" }}
                />
              }
            >
              Remove
            </Button>
          </Tooltip>
          {/* <Tooltip title="Add cookie"     overlayInnerStyle={{ fontSize: "14px", backgroundColor: "#FFFFFF", color: "#381A1A"  }}
            arrow={false}}>
            <Button style={{ backgroundColor: "#381A1A", color: "#fff" }}>Add</Button>
          </Tooltip> */}
          <Tooltip
            title="Import cookies"
            overlayInnerStyle={{
              fontSize: "14px",
              backgroundColor: "#FFFFFF",
              color: "#381A1A",
            }}
            open={isHovering && !isDropOpen}
            arrow={false}
            destroyTooltipOnHide={false}
          >
            <Dropdown
              menu={{
                items: [
                  {
                    key: "clipboard",
                    label: "Import from clipboard",
                    onClick: () => {
                      setEditingCookie(null);
                      setSelectedCookieName(null);
                      setImportMode("clipboard");
                    },
                  },
                  {
                    key: "file",
                    label: "Import from file",
                    onClick: () => handleImportCookies("file"),
                  },
                ],
              }}
              trigger={["click"]}
              onOpenChange={(open) => setIsDropOpen(open)}
            >
              <Button
                style={{ backgroundColor: "#381A1A", color: "#fff" }}
                ref={tooltipRef}
                icon={
                  <img
                    src={importico}
                    alt="deleteIcon"
                    style={{ width: "16px", height: "16px" }}
                  />
                }
              >
                Import
              </Button>
            </Dropdown>
          </Tooltip>
          <Tooltip
            title="Export cookies"
            overlayInnerStyle={{
              fontSize: "14px",
              backgroundColor: "#FFFFFF",
              color: "#381A1A",
            }}

            trigger={["hover", "click"]}
            arrow={false}
            open={!isExportOpen && isExportHover}
            destroyTooltipOnHide={false}
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
              onOpenChange={(open) => setIsExportOpen(open)}
              // getPopupContainer={trigger => trigger.parentNode}
            >
              <Button
                style={{ backgroundColor: "#381A1A", color: "#fff", opacity: cookies.length ? 1 : 0.5}}
                disabled={!cookies.length}
                ref={exportRef}
                icon={
                  <img
                    src={exportico}
                    alt="deleteIcon"
                    style={{ width: "16px", height: "16px"}}
                  />
                }
              >
                Export
              </Button>
            </Dropdown>
          </Tooltip>
        </Space>
        <div className="flex justify-end space-x-2">
          {editingCookie && (
            <>
              <Button
                onClick={() => {
                  setEditingCookie(null);
                  setSelectedCookieName(null);
                }}
                style={{ backgroundColor: "#6F6F6F", color: "#ffffff" }}
                icon={
                  <img
                    src={cancel}
                    alt="Cancel"
                    style={{ width: "16px", height: "16px" }}
                  />
                }
              >
                Cancel
              </Button>
              <Button
                style={{ backgroundColor: "#381A1A", color: "#fff" }}
                onClick={onSaveCookie}
                icon={
                  <img
                    src={update}
                    alt="Update"
                    style={{ width: "16px", height: "16px" }}
                  />
                }
              >
                Update
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pop;
