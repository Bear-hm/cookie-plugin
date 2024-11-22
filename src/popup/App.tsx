import { useEffect, useState } from "react";
import Pop from "./component/Pop";
import { ConfigProvider } from "antd";
import "./main"
const App = () => {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  
  useEffect(() => {
    if (chrome?.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || "";
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
        controlOutline: '#381A1A',
      },
      components: {
        Select: {
          optionSelectedColor: "#381A1A",
          optionSelectedBg: "#FAF3E9"
        },
        // Notification:{
        //   width:100,
        // }
      }
    }}
  >
    <Pop currentUrl={currentUrl}/>
    </ConfigProvider>
  );
};

export default App;