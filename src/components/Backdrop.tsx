import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { BackdropProps } from '../type';

const Backdrop = memo(
  forwardRef((props: BackdropProps, ref) => {
    const {
      backgroundColor = '#000',
      opacity: toOpacity = 0.5,
      animationDuration: duration = 200,
      animationDelay: delay = 0,
      visible = false,
      useNativeDriver = true,
      onPress = () => {},
      pointerEvents,
    } = props;

    const opacity = useRef(new Animated.Value(0)).current;

    useImperativeHandle(ref, () => ({
      setOpacity: (value: number) => {
        opacity.setValue(value);
      },
    }));

    useEffect(() => {
      const toValue = visible ? toOpacity : 0;
      Animated.timing(opacity, {
        toValue,
        duration,
        useNativeDriver,
        delay: visible ? 0 : delay,
      }).start();
    }, [visible, toOpacity, duration, delay, useNativeDriver]);

    const overlayStyle = [StyleSheet.absoluteFill, { backgroundColor, opacity }];

    return (
      <Animated.View pointerEvents={pointerEvents as any} style={overlayStyle}>
        <TouchableOpacity activeOpacity={1} onPress={onPress} style={StyleSheet.absoluteFill} />
      </Animated.View>
    );
  }),
);

Backdrop.displayName = 'Backdrop';

export default Backdrop;
