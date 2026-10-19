import type { ReactElement, ReactPortal } from 'react';
import { createPortal } from 'react-dom';
import { canUseDom } from './can-use-dom';
import { type GetContainer, resolveContainer } from './get-container';

export function renderToContainer(
  getContainer: GetContainer,
  node: ReactElement,
) {
  if (canUseDom && getContainer) {
    const container = resolveContainer(getContainer);
    return createPortal(node, container) as ReactPortal;
  }
  return node;
}
