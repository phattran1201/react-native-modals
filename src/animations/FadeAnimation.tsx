import { Animated } from 'react-native';
import Animation, { type AnimationConfig } from './Animation';

type FadeAnimationConfig = AnimationConfig & {
  animationDuration?: number;
};
export default class FadeAnimation extends Animation {
  constructor({ initialValue = 0, animationDuration = 200, useNativeDriver = true }: AnimationConfig = {}) {
    super({ initialValue, useNativeDriver, animationDuration });
  }

  in(onFinished: (result?: { finished: boolean }) => void = () => {}, duration?: number): void {
    Animated.timing(this.animate, {
      toValue: 1,
      duration: duration || this.animationDuration,
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
    return { opacity: this.animate };
  }
}
