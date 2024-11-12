import { createRoot } from 'react-dom/client'
import App from './App'
// import { ConfigProvider, theme } from 'antd'
//样式初始化
import '../common/styles/global.scss'
// const { darkAlgorithm } = theme;
createRoot(document.getElementById('root')!).render(
    // <ConfigProvider
    //     theme={{
    //         algorithm: darkAlgorithm,
    //         token: {
    //             colorBgContainer: '#141414',
    //             colorBgElevated: '#1f1f1f',
    //         }
    //     }}
    // >
        
    // </ConfigProvider>
    <App />
)