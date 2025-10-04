import React from "react";
import { DeviceEventEmitter } from "react-native";
import BaseModal from "./components/BaseModal";
import BottomModal from "./components/BottomModal";
import type { EmitModalPortal, ModalProps, StackItem } from "./type";

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

  static show(
    children: React.ReactNode,
    props: ModalProps & { key?: string; type?: "modal" | "bottomModal" } = {},
  ) {
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
    if (this.state.stack.length) {
      return this.state.stack[this.state.stack.length - 1].key;
    }
    return null;
  }

  generateKey = () => `modal-${this.id++}`;

  getIndex = (key: string) => this.state.stack.findIndex((i) => i.key === key);

  getProps = (
    props: ModalProps & { key?: string; type?: "modal" | "bottomModal" },
  ) => {
    const key = props?.key || this.generateKey();
    return { visible: true, ...props, key } as StackItem;
  };

  show = (
    props: ModalProps & { key?: string; type?: "modal" | "bottomModal" },
  ) => {
    const mergedProps = this.getProps(props);
    this.setState(({ stack }) => ({ stack: stack.concat(mergedProps) }));
    DeviceEventEmitter.emit("ModalPortal", {
      type: "show",
      key: mergedProps.key,
      stack: this.state.stack,
    } as EmitModalPortal);
    return mergedProps.key;
  };

  update = (key: string, props: ModalProps) => {
    const mergedProps = this.getProps({ ...props, key });
    this.setState(({ stack }) => {
      const index = this.getIndex(key);
      if (index >= 0) {
        stack[index] = { ...stack[index], ...mergedProps };
        DeviceEventEmitter.emit("ModalPortal", {
          type: mergedProps.visible ? "update" : "dismiss",
          key,
          stack,
        } as EmitModalPortal);
      }
      return { stack };
    });
  };

  dismiss = (key: string | null = this.current) => {
    if (!key) return;
    const idx = this.getIndex(key);
    if (idx < 0) return;
    const props = { ...this.state.stack[idx], visible: false };
    this.update(key, props);
  };

  dismissAll = () => {
    this.state.stack.forEach(({ key }) => this.dismiss(key));
  };

  dismissHandler = (key: string) => {
    // dismiss hander: which will remove data from stack and call onDismissed callback
    const idx = this.getIndex(key);
    if (idx < 0) return;
    const { onDismiss = () => {} } = this.state.stack[idx];
    this.setState(
      ({ stack }) => ({ stack: stack.filter((i) => i.key !== key) }),
      onDismiss,
    );
  };

  renderModal = (item: StackItem) => {
    const { type = "modal", key, ...props } = item;
    if (type === "modal") {
      return (
        <BaseModal
          {...props}
          key={key}
          onDismiss={() => this.dismissHandler(key)}
        />
      );
    } else if (type === "bottomModal") {
      return (
        <BottomModal
          {...props}
          key={key}
          onDismiss={() => this.dismissHandler(key)}
        />
      );
    }
  };

  render() {
    return this.state.stack.map(this.renderModal);
  }
}

export default ModalPortal;
