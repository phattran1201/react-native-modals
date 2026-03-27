import { Animated } from 'react-native';
import Animation from './Animation';

export default class ScaleAnimation extends Animation {
  in(onFinished: (result?: { finished: boolean }) => void = () => {}, duration?: number): void {
    const finalDuration = duration || this.animationDuration;
    if (finalDuration) {
      Animated.timing(this.animate, {
        toValue: 1,
        duration: finalDuration,
        useNativeDriver: this.useNativeDriver,
      }).start((result: { finished: boolean }) => onFinished(result));
      return;
    }
    Animated.spring(this.animate, {
      toValue: 1,
      velocity: 0,
      tension: 65,
      friction: 7,
      useNativeDriver: this.useNativeDriver,
    }).start((result: { finished: boolean }) => onFinished(result));
  }

  out(onFinished: (result?: { finished: boolean }) => void = () => {}, duration?: number): void {
    Animated.timing(this.animate, {
      toValue: 0,
      duration: duration || this.animationDuration,
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
