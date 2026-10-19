import type { ReactElement } from 'react';
import {
  cloneElement,
  createRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { renderToBody } from './render-to-body';

type ImperativeProps = {
  visible?: boolean;
  onClose?: () => void;
  afterClose?: () => void;
};

type TargetElement = ReactElement<ImperativeProps>;

export type ImperativeHandler = {
  close: () => void;
  replace: (element: TargetElement) => void;
  isRendered?: () => boolean;
};

export function renderImperatively(element: TargetElement) {
  const ImperativeWrapper = forwardRef<ImperativeHandler>(
    function ImperativeWrapper(_, ref) {
      const [visible, setVisible] = useState(false);
      const closedRef = useRef(false);
      const [elementToRender, setElementToRender] = useState(element);
      const keyRef = useRef(0);

      const onClose = useCallback(
        function onClose() {
          closedRef.current = true;
          setVisible(false);
          elementToRender.props.onClose?.();
        },
        [elementToRender.props.onClose],
      );

      const afterClose = useCallback(
        function afterClose() {
          unmount();
          elementToRender.props.afterClose?.();
        },
        [elementToRender.props.afterClose],
      );

      useImperativeHandle(ref, () => ({
        close: onClose,
        replace: (element) => {
          keyRef.current++;
          elementToRender.props.afterClose?.();
          setElementToRender(element);
        },
      }));

      useEffect(() => {
        if (!closedRef.current) {
          setVisible(true);
        } else {
          afterClose();
        }
      }, [afterClose]);

      return cloneElement(elementToRender, {
        ...elementToRender.props,
        key: keyRef.current,
        visible,
        onClose,
        afterClose,
      });
    },
  );

  const wrapperRef = createRef<ImperativeHandler>();

  const unmount = renderToBody(<ImperativeWrapper ref={wrapperRef} />);

  return {
    close: async () => {
      if (!wrapperRef.current) {
        // it means the wrapper is not mounted yet, call `unmount` directly
        unmount();
        // call `afterClose` to make sure the callback is called
        element.props.afterClose?.();
      } else {
        wrapperRef.current?.close();
      }
    },
    replace: (element) => {
      wrapperRef.current?.replace(element);
    },
    isRendered: () => !!wrapperRef.current,
  } as ImperativeHandler;
}
