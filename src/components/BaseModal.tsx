import React, {
  forwardRef,
  Fragment,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, BackHandler, StyleSheet, useWindowDimensions, View } from 'react-native';

import FadeAnimation from '../animations/FadeAnimation';
import type { ModalProps } from '../type';
import Backdrop from './Backdrop';
import DraggableView from './DraggableView';
import ModalContext from './ModalContext';

const HARDWARE_BACK_PRESS_EVENT = 'hardwareBackPress' as const;

// dialog states
const MODAL_OPENING = 'opening' as const;
const MODAL_OPENED = 'opened' as const;
const MODAL_CLOSING = 'closing' as const;
const MODAL_CLOSED = 'closed' as const;

const DEFAULT_ANIMATION_DURATION = 150;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  hidden: {
    top: -10000,
    left: 0,
    height: 0,
    width: 0,
  },
  round: {
    borderRadius: 8,
  },
  draggableView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type ModalState = typeof MODAL_OPENING | typeof MODAL_OPENED | typeof MODAL_CLOSING | typeof MODAL_CLOSED;

const BaseModal = memo(
  forwardRef((props: ModalProps, ref) => {
    const {
      rounded = true,
      modalTitle = null,
      visible = false,
      style = null,
      animationDuration = DEFAULT_ANIMATION_DURATION,
      animationDurationIn,
      animationDurationOut,
      modalStyle = null,
      width: propWidth = null,
      height: propHeight = null,
      onTouchOutside = () => {},
      onHardwareBackPress: propOnHardwareBackPress = () => false,
      hasOverlay = true,
      overlayOpacity = 0.5,
      overlayPointerEvents = null,
      overlayBackgroundColor = '#000',
      overlayAnimationDelay = 250,
      onShow = () => {},
      onDismiss = () => {},
      footer = null,
      onMove = () => {},
      onSwiping = () => {},
      onSwipeRelease = () => {},
      onSwipingOut: propOnSwipingOut = () => {},
      onSwipeOut,
      swipeDirection,
      swipeThreshold,
      useNativeDriver = true,
      isDelay = false,
      children,
      modalAnimation: propModalAnimation,
    } = props;

    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const [modalState, setModalState] = useState<ModalState>(MODAL_CLOSED);

    // Instances that don't need re-renders but need to persist
    const modalAnimation = useRef(
      propModalAnimation ||
        new FadeAnimation({
          animationDuration: animationDuration || DEFAULT_ANIMATION_DURATION,
        }),
    ).current;

    const backdropRef = useRef<any>(null);
    const closeTimerRef = useRef<any>(null);
    const lastSwipeEventRef = useRef<any | null>(null);
    const isSwipingOutRef = useRef<boolean>(false);

    const onHardwareBackPress = useCallback((): boolean => {
      return propOnHardwareBackPress ? propOnHardwareBackPress() : false;
    }, [propOnHardwareBackPress]);

    const show = useCallback((): void => {
      clearTimeout(closeTimerRef.current);
      setModalState(MODAL_OPENING);
      modalAnimation.in(() => {
        setModalState(MODAL_OPENED);
        onShow?.();
      }, animationDurationIn || animationDuration);
    }, [modalAnimation, onShow, animationDurationIn, animationDuration]);

    const dismiss = useCallback((): void => {
      const duration = animationDurationOut || animationDuration;
      setModalState(MODAL_CLOSING);

      const delay = hasOverlay ? (overlayAnimationDelay || 0) + (duration || 0) : 0;

      const finishDismiss = () => {
        if (delay > 0) {
          closeTimerRef.current = setTimeout(() => {
            setModalState(MODAL_CLOSED);
            onDismiss?.();
          }, delay);
        } else {
          setModalState(MODAL_CLOSED);
          onDismiss?.();
        }
      };

      if (isSwipingOutRef.current) {
        finishDismiss();
        return;
      }

      modalAnimation.out(finishDismiss, duration);
    }, [modalAnimation, onDismiss, animationDurationOut, animationDuration, hasOverlay, overlayAnimationDelay]);

    useImperativeHandle(ref, () => ({
      show,
      dismiss,
    }));

    useEffect(() => {
      const backHandler = BackHandler.addEventListener(HARDWARE_BACK_PRESS_EVENT, onHardwareBackPress);
      return () => {
        backHandler.remove();
        clearTimeout(closeTimerRef.current);
      };
    }, [onHardwareBackPress]);

    useEffect(() => {
      if (visible && modalState === MODAL_CLOSED) {
        show();
      } else if (!visible && (modalState === MODAL_OPENED || modalState === MODAL_OPENING)) {
        dismiss();
      }
    }, [visible, modalState, show, dismiss]);

    const pointerEvents = useMemo(() => {
      if (overlayPointerEvents) {
        return overlayPointerEvents;
      }
      return modalState === MODAL_OPENED ? 'auto' : 'none';
    }, [overlayPointerEvents, modalState]);

    const modalSizeStyle = useMemo(() => {
      let w = propWidth;
      let h = propHeight;
      if (w && w > 0.0 && w <= 1.0) {
        w *= screenWidth;
      }
      if (h && h > 0.0 && h <= 1.0) {
        h *= screenHeight;
      }
      return { width: w ?? undefined, height: h ?? undefined };
    }, [propWidth, propHeight, screenWidth, screenHeight]);

    const handleMove = useCallback(
      (event: any): void => {
        if (modalState === MODAL_CLOSING) {
          return;
        }
        if (!lastSwipeEventRef.current) {
          lastSwipeEventRef.current = event;
        }
        let newOpacity;
        const opacity = overlayOpacity ?? 0;
        if (Math.abs(event.axis.y)) {
          const lastAxis = Math.abs(lastSwipeEventRef.current.layout.y);
          const currAxis = Math.abs(event.axis.y);
          newOpacity = opacity - (opacity * currAxis) / (screenHeight - lastAxis);
        } else {
          const lastAxis = Math.abs(lastSwipeEventRef.current.layout.x);
          const currAxis = Math.abs(event.axis.x);
          newOpacity = opacity - (opacity * currAxis) / (screenWidth - lastAxis);
        }
        backdropRef.current?.setOpacity(newOpacity);
        onMove?.(event);
      },
      [modalState, overlayOpacity, screenWidth, screenHeight, onMove],
    );

    const handleSwipingOut = useCallback(
      (event: any) => {
        isSwipingOutRef.current = true;
        propOnSwipingOut?.(event);
      },
      [propOnSwipingOut],
    );

    const overlayVisible = hasOverlay && (modalState === MODAL_OPENING || modalState === MODAL_OPENED);
    const currentOverlayDuration =
      modalState === MODAL_CLOSING
        ? animationDurationOut || animationDuration
        : animationDurationIn || animationDuration;

    const roundStyle = rounded ? styles.round : null;
    const hiddenStyle = modalState === MODAL_CLOSED ? styles.hidden : null;

    const draggableViewStyle = useMemo(() => StyleSheet.flatten([styles.draggableView, style]), [style]);
    const modalViewStyle = useMemo(
      () => [styles.modal, roundStyle, modalSizeStyle, modalStyle, modalAnimation.getAnimations()],
      [roundStyle, modalSizeStyle, modalStyle, modalAnimation],
    );

    const renderDraggableContent = useCallback(
      ({ pan, onLayout }: any) => (
        <Fragment>
          <Backdrop
            ref={backdropRef}
            pointerEvents={pointerEvents}
            visible={overlayVisible}
            onPress={onTouchOutside}
            backgroundColor={overlayBackgroundColor}
            opacity={overlayOpacity}
            animationDuration={currentOverlayDuration}
            animationDelay={overlayAnimationDelay}
            useNativeDriver={useNativeDriver}
          />
          <Animated.View style={pan.getLayout()} onLayout={onLayout}>
            <Animated.View style={modalViewStyle}>
              {modalTitle}
              {isDelay ? (modalState === MODAL_OPENED ? children : null) : children}
              {footer}
            </Animated.View>
          </Animated.View>
        </Fragment>
      ),
      [
        pointerEvents,
        overlayVisible,
        onTouchOutside,
        overlayBackgroundColor,
        overlayOpacity,
        currentOverlayDuration,
        overlayAnimationDelay,
        useNativeDriver,
        modalViewStyle,
        modalTitle,
        isDelay,
        modalState,
        children,
        footer,
      ],
    );

    return (
      <ModalContext.Provider
        value={{
          hasTitle: Boolean(modalTitle),
          hasFooter: Boolean(footer),
        }}>
        <View pointerEvents={isSwipingOutRef.current ? 'none' : 'auto'} style={[styles.container, hiddenStyle]}>
          <DraggableView
            style={draggableViewStyle}
            onMove={handleMove}
            onSwiping={onSwiping}
            onRelease={onSwipeRelease}
            onSwipingOut={handleSwipingOut}
            onSwipeOut={onSwipeOut}
            swipeDirection={swipeDirection}
            swipeThreshold={swipeThreshold}>
            {renderDraggableContent}
          </DraggableView>
        </View>
      </ModalContext.Provider>
    );
  }),
);

BaseModal.displayName = 'BaseModal';

export default BaseModal;
