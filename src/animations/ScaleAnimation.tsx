// @flow

import { Animated } from "react-native";
import Animation from "./Animation";

export default class ScaleAnimation extends Animation {
  in(onFinished: (result?: { finished: boolean }) => void = () => {}): void {
    Animated.spring(this.animate, {
      toValue: 1,
      velocity: 0,
      tension: 65,
      friction: 7,
      useNativeDriver: this.useNativeDriver,
    }).start((result: { finished: boolean }) => onFinished(result));
  }

  out(onFinished: (result?: { finished: boolean }) => void = () => {}): void {
    Animated.timing(this.animate, {
      toValue: 0,
      duration: 200,
      useNativeDriver: this.useNativeDriver,
    }).start((result: { finished: boolean }) => onFinished(result));
  }

  getAnimations(): Object {
    return {
      transform: [
        {
          scale: this.animate.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      ],
    };
  }
}
