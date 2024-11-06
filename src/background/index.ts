// // 确保在 TypeScript 文件的顶部包含这一行来指定全局的 chrome 对象
// /// <reference types="chrome"/>

// chrome.runtime.onInstalled.addListener(function () {
//     // 默认先禁止Page Action。如果不加这一行，则无法生效下面的规则
//     chrome.action.disable();

//     chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
//         // 设置规则
//         const rule = {
//             // 运行插件运行的页面URL规则
//             conditions: [
//                 new chrome.declarativeContent.PageStateMatcher({
//                     pageUrl: {
//                         // 适配所有网站
//                         schemes: ['http', 'https'] // 适配http和https协议的网页
//                     }
//                 })
//             ],
//             actions: [
//                 new chrome.declarativeContent.ShowAction() // 显示Action
//             ]
//         };

//         // 整合所有规则
//         const rules = [rule];

//         // 执行规则
//         chrome.declarativeContent.onPageChanged.addRules(rules);
//     });
// });
console.log('background.ts test');
