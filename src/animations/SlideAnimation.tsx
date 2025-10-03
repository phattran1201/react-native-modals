import { Animated, Dimensions } from "react-native";
import Animation from "./Animation";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export type SlideFrom = "top" | "bottom" | "left" | "right";

export default class SlideAnimation extends Animation {
  slideFrom: SlideFrom;

  static SLIDE_FROM_TOP: SlideFrom = "top";
  static SLIDE_FROM_BOTTOM: SlideFrom = "bottom";
  static SLIDE_FROM_LEFT: SlideFrom = "left";
  static SLIDE_FROM_RIGHT: SlideFrom = "right";

  constructor({
    initialValue = 0,
    useNativeDriver = true,
    slideFrom = SlideAnimation.SLIDE_FROM_BOTTOM,
  } = {}) {
    super({ initialValue, useNativeDriver });
    this.slideFrom = slideFrom as SlideFrom;
  }

  in(onFinished: Animated.EndCallback = () => {}, options: any = {}): void {
    Animated.spring(this.animate, {
      toValue: 1,
      velocity: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: this.useNativeDriver,
      ...options,
    }).start(onFinished);
  }

  out(onFinished: Animated.EndCallback = () => {}, options: any = {}): void {
    Animated.spring(this.animate, {
      toValue: 0,
      velocity: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: this.useNativeDriver,
      ...options,
    }).start(onFinished);
  }

  getAnimations(): any {
    const transform: any[] = [];

    if (this.slideFrom === SlideAnimation.SLIDE_FROM_TOP) {
      transform.push({
        translateY: this.animate.interpolate({
          inputRange: [0, 1],
          outputRange: [-SCREEN_HEIGHT, 0],
        }),
      });
    } else if (this.slideFrom === SlideAnimation.SLIDE_FROM_BOTTOM) {
      transform.push({
        translateY: this.animate.interpolate({
          inputRange: [0, 1],
          outputRange: [SCREEN_HEIGHT, 0],
        }),
      });
    } else if (this.slideFrom === SlideAnimation.SLIDE_FROM_LEFT) {
      transform.push({
        translateX: this.animate.interpolate({
          inputRange: [0, 1],
          outputRange: [-SCREEN_WIDTH, 0],
        }),
      });
    } else if (this.slideFrom === SlideAnimation.SLIDE_FROM_RIGHT) {
      transform.push({
        translateX: this.animate.interpolate({
          inputRange: [0, 1],
          outputRange: [SCREEN_WIDTH, 0],
        }),
      });
    } else {
      throw new Error(
        `\n        slideFrom: ${this.slideFrom} not supported. 'slideFrom' must be 'top' | 'bottom' | 'left' | 'right'\n      `,
      );
    }

    return {
      transform,
    };
  }
}
