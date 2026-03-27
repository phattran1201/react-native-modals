import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ModalContentProps } from '../type';
import ModalContext from './ModalContext';

const styles = StyleSheet.create({
  content: {
    paddingVertical: 24,
    paddingHorizontal: 18,
  },
  noPaddingTop: {
    paddingTop: 0,
  },
});

const ModalContent = ({ style, children }: ModalContentProps) => (
  <ModalContext.Consumer>
    {({ hasTitle }) => <View style={[styles.content, hasTitle && styles.noPaddingTop, style]}>{children}</View>}
  </ModalContext.Consumer>
);

export default ModalContent;
