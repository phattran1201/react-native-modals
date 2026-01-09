// TypeScript types for the library

import { BlurViewProps } from "@sbaiahmed1/react-native-blur";
import { ReactNode } from "react";
import Animation from "./animations/Animation";

export type StackItem = ModalProps & {
  key: string;
  type?: "modal" | "bottomModal";
  onDismiss?: () => void;
};

export type EmitModalPortal = {
  type: "show" | "update" | "dismiss";
  key?: string;
  stack: StackItem[];
};

export type SwipeDirection = "up" | "down" | "left" | "right";

export type DragEvent = {
  axis: {
    x: number;
    y: number;
  };
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  swipeDirection: string | null;
};

export type ModalProps = {
  visible?: boolean;
  children?: any;
  width?: number;
  height?: number;
  rounded?: boolean;
  hasOverlay?: boolean;
  overlayPointerEvents?: "auto" | "none";
  overlayBackgroundColor?: string;
  overlayOpacity?: number;
  modalTitle?: any;
  modalAnimation?: Animation;
  modalStyle?: any;
  style?: any;
  animationDuration?: number;
  onTouchOutside?: () => void;
  onHardwareBackPress?: () => boolean;
  onShow?: () => void;
  onDismiss?: () => void;
  footer?: ReactNode;
  onMove?: (event: DragEvent) => void;
  onSwiping?: (event: DragEvent) => void;
  onSwipeRelease?: (event: DragEvent) => void;
  onSwipingOut?: (event: DragEvent) => void;
  onSwipeOut?: (event: DragEvent) => void;
  swipeDirection?: SwipeDirection | Array<SwipeDirection>;
  swipeThreshold?: number;
  useNativeDriver?: boolean;
  useBlurView?: boolean;
  blurProps?: BlurViewProps;
};

export type ModalFooterProps = {
  children?: any;
  style?: any;
  bordered?: boolean;
};

export type ModalButtonProps = {
  text: string;
  onPress?: () => void;
  align?: "left" | "right" | "center" | string;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
  activeOpacity?: number;
  bordered?: boolean;
};

export type ModalTitleProps = {
  title: any;
  style?: any;
  textStyle?: any;
  align?: "left" | "right" | "center" | string;
  hasTitleBar?: boolean;
};

export type ModalContentProps = {
  children: any;
  style?: any;
};

export type BackdropProps = {
  visible: boolean;
  opacity: number;
  onPress?: () => void;
  backgroundColor?: string;
  animationDuration?: number;
  pointerEvents?: "auto" | "none" | "box-none" | "box-only";
  useNativeDriver?: boolean;
  blurProps?: BlurViewProps;
  useBlurView?: boolean;
};
