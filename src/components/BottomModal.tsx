import React from 'react';
import { StyleSheet } from 'react-native';
import SlideAnimation from '../animations/SlideAnimation';
import type { ModalProps } from '../type';
import BaseModal from './BaseModal';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  modal: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
});

const BottomModal = (props: ModalProps) => {
  const { style, modalStyle, ...restProps } = props;

  const modalAnimation = React.useMemo(
    () =>
      new SlideAnimation({
        slideFrom: 'bottom',
      }),
    [],
  );

  return (
    <BaseModal
      modalAnimation={modalAnimation}
      {...restProps}
      style={StyleSheet.flatten([styles.container, style])}
      modalStyle={StyleSheet.flatten([styles.modal, modalStyle])}
      width={1}
      swipeDirection="down"
    />
  );
};

export default BottomModal;
