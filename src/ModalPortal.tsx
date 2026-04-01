import React from 'react';
import { DeviceEventEmitter } from 'react-native';
import BaseModal from './components/BaseModal';
import BottomModal from './components/BottomModal';
import type { EmitModalPortal, ModalProps, StackItem } from './type';

let modal: ModalPortal | null = null;
let modalCounter = 0;

export default class ModalPortal extends React.Component<{}, { stack: StackItem[] }> {
  private dismissHandlers = new Map<string, () => void>();

  constructor(props: {}) {
    super(props);
    this.state = { stack: [] };
    modal = this;
  }

  componentWillUnmount() {
    if (modal === this) {
      modal = null;
    }
    this.dismissHandlers.clear();
  }

  static get ref() {
    return modal;
  }

  static get size() {
    return modal?.state.stack.length ?? 0;
  }

  static show(children: React.ReactNode, props: ModalProps & { key?: string } = {}) {
    return modal!.show({ children, ...props, key: props.key });
  }

  static update(key: string, props: ModalProps) {
    modal?.update(key, props);
  }

  static dismiss(key?: string) {
    modal?.dismiss(key);
  }

  static dismissAll() {
    modal?.dismissAll();
  }

  static destroy(key?: string) {
    modal?.destroy(key);
  }

  static destroyAll() {
    modal?.destroyAll();
  }

  get current() {
    const { stack } = this.state;
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      if (stack[i].visible) {
        return stack[i].key;
      }
    }
    return null;
  }

  generateKey = () => {
    modalCounter++;
    return `modal-${modalCounter}`;
  };

  getProps = (props: ModalProps & { key?: string }) => {
    const key = props?.key || this.generateKey();
    return { visible: true, ...props, key } as StackItem;
  };

  show = (props: ModalProps & { key?: string }) => {
    const mergedProps = this.getProps(props);

    this.setState(
      ({ stack }) => {
        const index = stack.findIndex((i) => i.key === mergedProps.key);
        let newStack;
        if (index > -1) {
          const item = { ...stack[index], ...mergedProps };
          newStack = stack.filter((i) => i.key !== mergedProps.key).concat(item);
        } else {
          newStack = stack.concat(mergedProps);
        }
        return { stack: newStack };
      },
      () => {
        DeviceEventEmitter.emit('ModalPortal', {
          type: 'show',
          key: mergedProps.key,
          stack: this.state.stack,
        } as EmitModalPortal);
      },
    );
    return mergedProps.key;
  };

  update = (key: string, props: ModalProps) => {
    const mergedProps = this.getProps({ ...props, key });
    this.setState(
      ({ stack }) => {
        const index = stack.findIndex((i) => i.key === key);
        if (index === -1) {
          return null;
        }
        const isShowing = !stack[index].visible && mergedProps.visible;
        const newStack = [...stack];

        if (isShowing) {
          const item = { ...newStack[index], ...mergedProps };
          newStack.splice(index, 1);
          newStack.push(item);
        } else {
          newStack[index] = { ...newStack[index], ...mergedProps };
        }

        return { stack: newStack };
      },
      () => {
        DeviceEventEmitter.emit('ModalPortal', {
          type: mergedProps.visible ? 'update' : 'dismiss',
          key,
          stack: this.state.stack,
        } as EmitModalPortal);
      },
    );
  };

  dismiss = (key: string | null = this.current) => {
    if (!key) return;
    this.update(key, { visible: false });
  };

  dismissAll = () => {
    this.setState(
      ({ stack }) => {
        if (stack.every((item) => !item.visible)) return null;
        const newStack = stack.map((item) => ({ ...item, visible: false }));
        return { stack: newStack };
      },
      () => {
        DeviceEventEmitter.emit('ModalPortal', {
          type: 'dismissAll',
          stack: this.state.stack,
        } as EmitModalPortal);
      },
    );
  };

  destroy = (key: string | null = this.current) => {
    if (!key) return;
    this.setState(
      ({ stack }) => ({ stack: stack.filter((i) => i.key !== key) }),
      () => {
        this.dismissHandlers.delete(key);
      },
    );
  };

  destroyAll = () => {
    this.setState({ stack: [] }, () => {
      this.dismissHandlers.clear();
    });
  };

  dismissHandler = (key: string) => {
    const item = this.state.stack.find((i) => i.key === key);
    if (!item) return;

    if (item.destroyOnDismiss === false) {
      item.onDismiss?.();
      return;
    }

    this.destroy(key);
    item.onDismiss?.();
  };

  getStableDismissHandler = (key: string) => {
    let handler = this.dismissHandlers.get(key);
    if (!handler) {
      handler = () => this.dismissHandler(key);
      this.dismissHandlers.set(key, handler);
    }
    return handler;
  };

  renderModal = (item: StackItem) => {
    const { type = 'modal', key, ...props } = item;
    const Component = type === 'bottomModal' ? BottomModal : BaseModal;
    return <Component {...props} key={key} onDismiss={this.getStableDismissHandler(key)} />;
  };

  render() {
    return this.state.stack.map(this.renderModal);
  }
}
