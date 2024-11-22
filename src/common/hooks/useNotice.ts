// 二次封装 notification框
import { notification } from "antd";
import { ArgsProps } from "antd/es/notification";

const Notice = () => {
  const getConfig = (config: ArgsProps): ArgsProps => ({
    duration: 3,
    placement: "top",
    ...config,
  });

  return {
    success: (config: ArgsProps) => notification.success(getConfig(config)),
    error: (config: ArgsProps) => notification.error(getConfig(config)),
    info: (config: ArgsProps) => notification.info(getConfig(config)),
    warning: (config: ArgsProps) => notification.warning(getConfig(config)),
  };
};

export const notice = Notice();
