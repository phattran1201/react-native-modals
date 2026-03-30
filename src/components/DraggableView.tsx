import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, PanResponderGestureState, useWindowDimensions } from 'react-native';
import type { DragEvent, SwipeDirection } from '../type';

type Props = {
  style?: any;
  onMove?: (event: DragEvent) => void;
  onSwiping?: (event: DragEvent) => void;
  onRelease?: (event: DragEvent) => void;
  onSwipingOut?: (event: DragEvent) => void;
  onSwipeOut?: (event: DragEvent) => void;
  swipeThreshold?: number;
  swipeDirection?: SwipeDirection | Array<SwipeDirection>;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  children: (args: { onLayout: (event: any) => void; pan: Animated.ValueXY }) => React.ReactNode;
};

const DraggableView = memo((props: Props) => {
  const {
    style = null,
    onMove = () => {},
    onSwiping = () => {},
    onSwipingOut = () => {},
    onSwipeOut = null,
    onRelease = () => {},
    swipeThreshold = 100,
    swipeDirection = [],
    pointerEvents = 'auto',
    children: renderContent,
  } = props;

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const pan = useRef(new Animated.ValueXY()).current;
  const layoutRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const currentSwipeDirectionRef = useRef<SwipeDirection | null>(null);

  // Track pan values without using ._value
  const propsRef = useRef(props);
  propsRef.current = props;

  const panValueRef = useRef({ x: 0, y: 0 });

  const allowedDirections = useMemo(
    () => ([] as SwipeDirection[]).concat(props.swipeDirection || []),
    [props.swipeDirection],
  );

  useEffect(() => {
    const panListenerId = pan.addListener((value) => {
      panValueRef.current = value;
      propsRef.current.onMove?.({
        axis: value,
        layout: layoutRef.current,
        swipeDirection: currentSwipeDirectionRef.current,
      });
    });
    return () => pan.removeListener(panListenerId);
  }, [pan]);

  const onLayout = useCallback((event: any) => {
    layoutRef.current = event.nativeEvent.layout;
  }, []);

  const getSwipeDirection = useCallback((gestureState: PanResponderGestureState): SwipeDirection | null => {
    const { dx, dy, vx, vy } = gestureState;
    const velocityThreshold = 0.3;
    const directionalOffsetThreshold = 80;

    if (Math.abs(vx) > velocityThreshold && Math.abs(dy) < directionalOffsetThreshold) {
      return dx > 0 ? 'right' : 'left';
    } else if (Math.abs(vy) > velocityThreshold && Math.abs(dx) < directionalOffsetThreshold) {
      return dy > 0 ? 'down' : 'up';
    }
    return null;
  }, []);

  const getDisappearDirection = useCallback(() => {
    const vertical = screenHeight / 2 + (layoutRef.current ? layoutRef.current.height / 2 : 0);
    const horizontal = screenWidth / 2 + (layoutRef.current ? layoutRef.current.width / 2 : 0);

    switch (currentSwipeDirectionRef.current) {
      case 'up':
        return { x: 0, y: -vertical };
      case 'down':
        return { x: 0, y: vertical };
      case 'left':
        return { x: -horizontal, y: 0 };
      case 'right':
        return { x: horizontal, y: 0 };
      default:
        return undefined;
    }
  }, [screenWidth, screenHeight]);

  const isAllowedDirection = useCallback(
    (gestureState: PanResponderGestureState) => {
      const { dx, dy } = gestureState;
      const draggedDown = dy > 0;
      const draggedUp = dy < 0;
      const draggedLeft = dx < 0;
      const draggedRight = dx > 0;

      const isCurrent = (d: SwipeDirection) => currentSwipeDirectionRef.current === d && allowedDirections.includes(d);

      return (
        (draggedDown && isCurrent('down')) ||
        (draggedUp && isCurrent('up')) ||
        (draggedLeft && isCurrent('left')) ||
        (draggedRight && isCurrent('right'))
      );
    },
    [allowedDirections],
  );

  const createDragEvent = useCallback(
    (): DragEvent => ({
      axis: panValueRef.current,
      layout: layoutRef.current,
      swipeDirection: currentSwipeDirectionRef.current,
    }),
    [],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          allowedDirections.length > 0,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          allowedDirections.length > 0 &&
          (gestureState.dx !== 0 || gestureState.dy !== 0),
        onPanResponderMove: (event, gestureState) => {
          const isVertical = (d: SwipeDirection | null) => d === 'up' || d === 'down';
          const isHorizontal = (d: SwipeDirection | null) => d === 'left' || d === 'right';

          const newDir = getSwipeDirection(gestureState);
          const isSame =
            isVertical(currentSwipeDirectionRef.current) === isVertical(newDir) ||
            isHorizontal(currentSwipeDirectionRef.current) === isHorizontal(newDir);

          if (newDir && isSame) {
            currentSwipeDirectionRef.current = newDir;
          }

          if (isAllowedDirection(gestureState)) {
            let animEvent: any;
            if (isVertical(currentSwipeDirectionRef.current)) {
              animEvent = { dy: pan.y };
            } else if (isHorizontal(currentSwipeDirectionRef.current)) {
              animEvent = { dx: pan.x };
            }

            if (animEvent) {
              Animated.event([null, animEvent], { useNativeDriver: false })(event, gestureState);
            }
            propsRef.current.onSwiping?.(createDragEvent());
          }
        },
        onPanResponderRelease: () => {
          pan.flattenOffset();
          const event = createDragEvent();
          const threshold = propsRef.current.swipeThreshold ?? 100;

          if (
            (propsRef.current.onSwipeOut && Math.abs(panValueRef.current.y) > threshold) ||
            Math.abs(panValueRef.current.x) > threshold
          ) {
            const toValue = getDisappearDirection();
            propsRef.current.onSwipingOut?.(event);
            if (!toValue) return;

            Animated.spring(pan, {
              toValue,
              velocity: 0,
              tension: 65,
              friction: 11,
              useNativeDriver: false,
            }).start(() => {
              propsRef.current.onSwipeOut?.(event);
            });
            return;
          }

          currentSwipeDirectionRef.current = null;
          propsRef.current.onRelease?.(event);
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            velocity: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: false,
          }).start();
        },
      }),
    [getSwipeDirection, isAllowedDirection, pan, createDragEvent, getDisappearDirection],
  );

  const content = renderContent({
    pan,
    onLayout,
  });

  return (
    <Animated.View {...panResponder.panHandlers} style={style} pointerEvents={pointerEvents}>
      {content}
    </Animated.View>
  );
});

DraggableView.displayName = 'DraggableView';

export default DraggableView;
