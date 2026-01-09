// @flow

import { BlurView } from "@sbaiahmed1/react-native-blur";
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
    useBlurView: false,
    onPress: () => {},
    blurProps: {
      blurType: "extraDark",
      blurAmount: 20,
      reducedTransparencyFallbackColor: "#000000",
    },
  };

  opacity = new Animated.Value(0);

  componentDidUpdate(prevProps: BackdropProps) {
    const { visible, useNativeDriver = true, opacity: toOpacity = 0.5, animationDuration: duration = 200 } = this.props;
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
    const { onPress, pointerEvents, backgroundColor, useBlurView, blurProps } = this.props;
    const { opacity } = this;
    const overlayStyle: any = [StyleSheet.absoluteFill, { backgroundColor, opacity }];
    const _children = (
      <Animated.View pointerEvents={pointerEvents as any} style={overlayStyle}>
        <TouchableOpacity onPress={onPress} style={StyleSheet.absoluteFill} />
      </Animated.View>
    );
    return useBlurView ? (
      <BlurView {...blurProps} style={StyleSheet.absoluteFill}>
        {_children}
      </BlurView>
    ) : (
      _children
    );
  }
}
