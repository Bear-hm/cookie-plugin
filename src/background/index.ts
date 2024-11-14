chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 立即返回 true 表示我们将异步发送响应
  if (request.type === "getCookies") {
    chrome.cookies
      .getAll({ url: request.url })
      .then((cookies) => {
        sendResponse({ success: true, cookies });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; 
  }
});

