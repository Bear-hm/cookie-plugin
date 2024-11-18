import { useEffect, useState } from "react";
import Pop from "./component/Pop";
import { ConfigProvider } from "antd";
const App = () => {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  console.log("current Url ",currentUrl);
  
  useEffect(() => {
    if (chrome?.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || "";
        console.log("Current tab URL:", url);
        setCurrentUrl(url);
      });
    } else {
      console.log("Currently in development environment, Chrome API is not available");
    }
  }, []);

  return (
    <ConfigProvider
    theme={{
      token: {
        colorPrimary:'#381A1A',
        colorPrimaryActive:'#FAF3E9',
        colorPrimaryBgHover: '#FAF3E9',
        controlOutline: '#381A1A'
      }
    }}
  >
    <Pop currentUrl={currentUrl}/>
    </ConfigProvider>
  );
};

export default App;