/* eslint class-methods-use-this: ["error", { "exceptMethods": ["in", "out", "getAnimations"] }] */
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "onFinished" }] */

import { Animated } from 'react-native';

export type AnimationConfig = {
  initialValue?: number;
  useNativeDriver?: boolean;
  animationDuration?: number;
};

// Base Animation class
export default class Animation {
  useNativeDriver: boolean;
  animate: Animated.Value;
  animationDuration: number;

  constructor({ initialValue = 0, useNativeDriver = true, animationDuration = 200 }: AnimationConfig = {}) {
    this.animate = new Animated.Value(initialValue);
    this.useNativeDriver = useNativeDriver;
    this.animationDuration = animationDuration;
  }

  in(onFinished?: Function, duration?: number): void {
    throw Error('not implemented yet');
  }

  out(onFinished?: Function, duration?: number): void {
    throw Error('not implemented yet');
  }

  getAnimations(): Object {
    throw Error('not implemented yet');
  }
}
