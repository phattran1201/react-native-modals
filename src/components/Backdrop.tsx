// @flow

import React, { Component } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import { BackdropProps } from "../type";

export default class Backdrop extends Component<BackdropProps> {
  static defaultProps: Partial<BackdropProps> = {
    backgroundColor: "#000",
    opacity: 0.5,
    animationDuration: 200,
    visible: false,
    useNativeDriver: true,
    onPress: () => {},
  };

  opacity = new Animated.Value(0);

  componentDidUpdate(prevProps: BackdropProps) {
    const {
      visible,
      useNativeDriver = true,
      opacity: toOpacity = 0.5,
      animationDuration: duration = 200,
    } = this.props;
    if (prevProps.visible !== visible) {
      const toValue = visible ? toOpacity : 0;
      Animated.timing(this.opacity, {
        toValue,
        duration,
        useNativeDriver,
      }).start();
    }
  }

  setOpacity = (value: number) => {
    this.opacity.setValue(value);
  };

  render() {
    const { onPress, pointerEvents, backgroundColor } = this.props;
    const { opacity } = this;
    const overlayStyle: any = [
      StyleSheet.absoluteFill,
      { backgroundColor, opacity },
    ];
    return (
      <Animated.View pointerEvents={pointerEvents as any} style={overlayStyle}>
        <TouchableOpacity onPress={onPress} style={StyleSheet.absoluteFill} />
      </Animated.View>
    );
  }
}
