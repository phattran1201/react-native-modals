import React, { Component } from "react";
import { Animated, Dimensions, PanResponder } from "react-native";
import type { DragEvent, SwipeDirection } from "../type";

type Props = {
  style?: any;
  onMove?: (event: DragEvent) => void;
  onSwiping?: (event: DragEvent) => void;
  onRelease?: (event: DragEvent) => void;
  onSwipingOut?: (event: DragEvent) => void;
  onSwipeOut?: (event: DragEvent) => void;
  swipeThreshold?: number;
  swipeDirection?: SwipeDirection | Array<SwipeDirection>;
  children: ({
    onLayout,
    pan,
  }: {
    onLayout: (event: any) => void;
    pan: Animated.ValueXY;
  }) => React.ReactNode;
};

export default class DraggableView extends Component<Props> {
  static defaultProps = {
    style: null,
    onMove: () => {},
    onSwiping: () => {},
    onSwipingOut: () => {},
    onSwipeOut: null,
    onRelease: () => {},
    swipeThreshold: 100,
    swipeDirection: [],
  };

  // instance properties
  pan: Animated.ValueXY;
  allowedDirections: SwipeDirection[];
  layout: { x: number; y: number; width: number; height: number } | null;
  panEventListenerId: string | number | null = null;
  currentSwipeDirection: SwipeDirection | null = null;

  constructor(props: Props) {
    super(props);

    this.pan = new Animated.ValueXY();
    this.allowedDirections = ([] as SwipeDirection[]).concat(
      props.swipeDirection || [],
    );
    this.layout = null;
  }

  componentDidMount() {
    this.panEventListenerId = this.pan.addListener(
      (axis: { x: number; y: number }) => {
        this.props.onMove?.(this.createDragEvent(axis));
      },
    );
  }

  componentWillUnmount() {
    if (this.panEventListenerId != null) {
      this.pan.removeListener(this.panEventListenerId as string);
    }
  }

  onLayout = (event: any) => {
    this.layout = event.nativeEvent.layout;
  };

  getSwipeDirection(gestureState: any): SwipeDirection | null {
    if (this.isValidHorizontalSwipe(gestureState)) {
      return gestureState.dx > 0 ? "right" : "left";
    } else if (this.isValidVerticalSwipe(gestureState)) {
      return gestureState.dy > 0 ? "down" : "up";
    }
    return null;
  }

  getDisappearDirection() {
    const { width, height } = Dimensions.get("window");
    const vertical = height / 2 + (this.layout ? this.layout.height / 2 : 0);
    const horizontal = width / 2 + (this.layout ? this.layout.width / 2 : 0);
    let toValue;
    if (this.currentSwipeDirection === "up") {
      toValue = {
        x: 0,
        y: -vertical,
      };
    } else if (this.currentSwipeDirection === "down") {
      toValue = {
        x: 0,
        y: vertical,
      };
    } else if (this.currentSwipeDirection === "left") {
      toValue = {
        x: -horizontal,
        y: 0,
      };
    } else if (this.currentSwipeDirection === "right") {
      toValue = {
        x: horizontal,
        y: 0,
      };
    }
    return toValue;
  }

  isValidHorizontalSwipe({ vx, dy }: any) {
    return this.isValidSwipe(vx, dy);
  }

  isValidVerticalSwipe({ vy, dx }: any) {
    return this.isValidSwipe(vy, dx);
  }

  // eslint-disable-next-line class-methods-use-this
  isValidSwipe(velocity: number, directionalOffset: number) {
    const velocityThreshold = 0.3;
    const directionalOffsetThreshold = 80;
    // eslint-disable-next-line max-len
    return (
      Math.abs(velocity) > velocityThreshold &&
      Math.abs(directionalOffset) < directionalOffsetThreshold
    );
  }

  isAllowedDirection({ dy, dx }: any) {
    const draggedDown = dy > 0;
    const draggedUp = dy < 0;
    const draggedLeft = dx < 0;
    const draggedRight = dx > 0;
    const isAllowedDirection = (d: SwipeDirection) =>
      this.currentSwipeDirection === d && this.allowedDirections.includes(d);
    if (draggedDown && isAllowedDirection("down")) {
      return true;
    } else if (draggedUp && isAllowedDirection("up")) {
      return true;
    } else if (draggedLeft && isAllowedDirection("left")) {
      return true;
    } else if (draggedRight && isAllowedDirection("right")) {
      return true;
    }
    return false;
  }

  createDragEvent(axis: { x: number; y: number }): DragEvent {
    return {
      axis,
      layout: this.layout,
      swipeDirection: this.currentSwipeDirection,
    };
  }

  panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) =>
      gestureState.dx !== 0 && gestureState.dy !== 0,
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event: any, gestureState: any) => {
      const isVerticalSwipe = (d: SwipeDirection | null) =>
        ["up", "down"].includes(d as string);
      const isHorizontalSwipe = (d: SwipeDirection | null) =>
        ["left", "right"].includes(d as string);

      const newSwipeDirection = this.getSwipeDirection(gestureState);
      const isSameDirection =
        isVerticalSwipe(this.currentSwipeDirection) ===
          isVerticalSwipe(newSwipeDirection) ||
        isHorizontalSwipe(this.currentSwipeDirection) ===
          isHorizontalSwipe(newSwipeDirection);
      // newDirection & currentSwipeDirection must be same direction
      if (newSwipeDirection && isSameDirection) {
        this.currentSwipeDirection = newSwipeDirection;
      }
      if (this.isAllowedDirection(gestureState)) {
        let animEvent: any;
        if (isVerticalSwipe(this.currentSwipeDirection)) {
          animEvent = { dy: this.pan.y };
        } else if (isHorizontalSwipe(this.currentSwipeDirection)) {
          animEvent = { dx: this.pan.x };
        }
        if (animEvent) {
          Animated.event([null, animEvent], { useNativeDriver: false })(
            event,
            gestureState,
          );
        }
        this.props.onSwiping?.(
          this.createDragEvent({
            x: (this.pan.x as any)._value,
            y: (this.pan.y as any)._value,
          }),
        );
      }
    },
    onPanResponderRelease: () => {
      this.pan.flattenOffset();
      const event = this.createDragEvent({
        x: (this.pan.x as any)._value,
        y: (this.pan.y as any)._value,
      });
      // on swipe out
      const threshold = this.props.swipeThreshold ?? 0;
      if (
        (this.props.onSwipeOut &&
          Math.abs((this.pan.y as any)._value) > threshold) ||
        Math.abs((this.pan.x as any)._value) > threshold
      ) {
        const toValue = this.getDisappearDirection();
        this.props.onSwipingOut?.(event);
        if (!toValue) return;
        Animated.spring(this.pan, {
          toValue,
          velocity: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: false,
        }).start(() => {
          this.props.onSwipeOut?.(event);
        });
        return;
      }
      // on release
      this.currentSwipeDirection = null;
      this.props.onRelease?.(event);
      Animated.spring(this.pan, {
        toValue: { x: 0, y: 0 },
        velocity: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: false,
      }).start();
    },
  });

  render() {
    const { style, children: renderContent } = this.props;
    const content = renderContent({
      pan: this.pan,
      onLayout: this.onLayout,
    });

    return (
      <Animated.View {...this.panResponder.panHandlers} style={style}>
        {content}
      </Animated.View>
    );
  }
}
