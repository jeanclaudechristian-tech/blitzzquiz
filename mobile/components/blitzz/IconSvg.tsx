import React from "react";
import { SvgXml } from "react-native-svg";

export function IconSvg({ uri, width, height }: { uri: any, width: number, height: number }) {
  if (!uri) return null;

  // 如果 transformer 工作正常，uri 是一个组件
  const SvgComponent = uri.default || uri;

  if (typeof SvgComponent === 'function') {
    return <SvgComponent width={width} height={height} />;
  }

  // 降级处理：如果还是显示不出来，至少不会导致 App 崩溃
  return null;
}