import React from 'react';
import { DeviceEventEmitter } from 'react-native';
import BaseModal from './components/BaseModal';
import BottomModal from './components/BottomModal';
import type { EmitModalPortal, ModalProps, StackItem } from './type';

let modal: ModalPortal | null = null;

class ModalPortal extends React.Component<{}, { stack: StackItem[] }> {
  id: number;
  constructor(props: {}) {
    super(props);
    this.state = { stack: [] };
    this.id = 0;
    modal = this;
  }

  static get ref() {
    return modal;
  }

  static get size() {
    return modal?.state.stack.length ?? 0;
  }

  static show(children: React.ReactNode, props: ModalProps & { key?: string; type?: 'modal' | 'bottomModal' } = {}) {
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

  get current() {
    const { stack } = this.state;
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      if (stack[i].visible) {
        return stack[i].key;
      }
    }
    return null;
  }

  static counter = 0;

  generateKey = () => {
    ModalPortal.counter += 1;
    return `modal-${ModalPortal.counter}`;
  };

  getIndex = (key: string) => this.state.stack.findIndex((i) => i.key === key);

  getProps = (props: ModalProps & { key?: string; type?: 'modal' | 'bottomModal' }) => {
    const key = props?.key || this.generateKey();
    return { visible: true, ...props, key } as StackItem;
  };

  show = (props: ModalProps & { key?: string; type?: 'modal' | 'bottomModal' }) => {
    const mergedProps = this.getProps(props);
    const index = this.getIndex(mergedProps.key);

    if (index > -1) {
      this.update(mergedProps.key, mergedProps);
      return mergedProps.key;
    }

    this.setState(
      ({ stack }) => ({ stack: stack.concat(mergedProps) }),
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
    this.setState(({ stack }) => {
      const index = this.getIndex(key);
      if (index === -1) {
        return null;
      }
      const newStack = [...stack];
      newStack[index] = { ...newStack[index], ...mergedProps };

      DeviceEventEmitter.emit('ModalPortal', {
        type: mergedProps.visible ? 'update' : 'dismiss',
        key,
        stack: newStack,
      } as EmitModalPortal);

      return { stack: newStack };
    });
  };

  dismiss = (key: string | null = this.current) => {
    if (!key) return;
    const idx = this.getIndex(key);
    if (idx === -1) return;
    const props = { ...this.state.stack[idx], visible: false };
    this.update(key, props);
  };

  dismissAll = () => {
    this.setState(({ stack }) => {
      const newStack = stack.map((item) => ({ ...item, visible: false }));
      return { stack: newStack };
    });
  };

  dismissHandler = (key: string) => {
    // dismiss hander: which will remove data from stack and call onDismissed callback
    const idx = this.getIndex(key);
    if (idx === -1) return;
    const { onDismiss = () => {} } = this.state.stack[idx];
    this.setState(({ stack }) => ({ stack: stack.filter((i) => i.key !== key) }), onDismiss);
  };

  renderModal = (item: StackItem) => {
    const { type = 'modal', key, ...props } = item;
    if (type === 'modal') {
      return <BaseModal {...props} key={key} onDismiss={() => this.dismissHandler(key)} />;
    } else if (type === 'bottomModal') {
      return <BottomModal {...props} key={key} onDismiss={() => this.dismissHandler(key)} />;
    }
  };

  render() {
    return this.state?.stack?.map(this.renderModal);
  }
}

export default ModalPortal;
