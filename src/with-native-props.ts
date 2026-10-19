import clsx from 'clsx';
import type React from 'react';
import { cloneElement } from 'react';

export type NativeProps<S extends string = never> = {
  className?: string;
  style?: React.CSSProperties & Partial<Record<S, string>>;
  tabIndex?: number;
} & React.AriaAttributes;

export function withNativeProps<
  P extends NativeProps<S>,
  S extends string = never,
>(props: P, element: React.ReactElement<Record<string, any>>) {
  const p = { ...element.props };
  if (props.className) {
    p.className = clsx(element.props.className, props.className);
  }
  if (props.style) {
    p.style = { ...p.style, ...props.style };
  }
  if (props.tabIndex !== undefined) {
    p.tabIndex = props.tabIndex;
  }
  for (const key in props) {
    if (!Object.hasOwn(props, key)) continue;
    if (key.startsWith('data-') || key.startsWith('aria-')) {
      p[key] = props[key];
    }
  }
  return cloneElement(element, p);
}
export default withNativeProps;
