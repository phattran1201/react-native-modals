# @haroldtran/react-native-modals

> Cross-platform React Native modal components and utilities for building flexible dialogs, bottom sheets, and animated modals on iOS and Android.

**Maintained and enhanced by [Harold - @phattran1201](https://github.com/phattran1201) 👨‍💻**

## Features

- Declarative `Modal` component with customizable title, content, footer and animations
- Bottom sheet-style `BottomModal`
- Imperative `ModalPortal` API for showing/updating/dismissing modals from anywhere in your app
- Built-in animations: `FadeAnimation`, `ScaleAnimation`, `SlideAnimation` and the base `Animation` class for custom animations
- Backdrop control and swipe-to-dismiss support
- TypeScript types included

---

## Installation

Install the published package (scoped):

```bash
npm install --save @haroldtran/react-native-modals
# or
yarn add @haroldtran/react-native-modals
```

Peer dependencies: react, react-native

---

## Quick Setup

The library exposes an imperative portal that must be mounted near the root of your app. Add `ModalPortal` to your app root so the portal can render modals:

```jsx
import React from 'react';
import { ModalPortal } from '@haroldtran/react-native-modals';

export default function Root({ children }) {
  return (
    <>
      {children}
      <ModalPortal />
    </>
  );
}
```

If you use Redux or other providers, mount `ModalPortal` alongside them.

---

## Basic Usage

```jsx
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { Modal, ModalContent } from '@haroldtran/react-native-modals';

export default function Example() {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Button title="Show Modal" onPress={() => setVisible(true)} />

      <Modal
        visible={visible}
        onTouchOutside={() => setVisible(false)}
      >
        <ModalContent>
          <Text>Hello from the modal</Text>
        </ModalContent>
      </Modal>
    </View>
  );
}
```

---

## Imperative API (ModalPortal)

Use the `ModalPortal` to show modals programmatically from anywhere in your app. The portal returns an id which you can use to update or dismiss that modal.

```jsx
import { ModalPortal } from '@haroldtran/react-native-modals';

// Show a modal and keep the returned id
const id = ModalPortal.show(
  <View>
    <Text>Imperative modal</Text>
  </View>
);

// Update the modal content later
ModalPortal.update(id, {
  children: (
    <View>
      <Text>Updated</Text>
    </View>
  ),
});

// Dismiss a specific modal
ModalPortal.dismiss(id);

// Dismiss all open modals
ModalPortal.dismissAll();
```

---

## Animations

The library includes a base `Animation` class and several concrete implementations:

- `FadeAnimation` — fade in/out
- `ScaleAnimation` — scale from/to a value
- `SlideAnimation` — slide from `top`, `bottom`, `left` or `right`

Example: passing a `SlideAnimation` to a `Modal`

```jsx
import { Modal, SlideAnimation } from '@haroldtran/react-native-modals';

<Modal
  visible={visible}
  modalAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
>
  <ModalContent />
</Modal>
```

Create a custom animation by extending `Animation` and overriding `in`, `out` and `getAnimations()`.

---

## Components & Types (exports)

The package exports the following components and TypeScript types:

- Modal (default export)
- BottomModal
- ModalPortal
- Backdrop
- ModalButton
- ModalContent
- ModalTitle
- ModalFooter
- Animation, FadeAnimation, ScaleAnimation, SlideAnimation

Types:

- DragEvent, SwipeDirection, ModalProps, ModalFooterProps, ModalButtonProps, ModalTitleProps, ModalContentProps, BackdropProps

For more details see the `src` folder and the types in `src/type.ts`.

---

## Tips & Notes

- The `ModalPortal` must be mounted for the imperative APIs to work.
- `Modal` supports swipe-to-dismiss and provides callbacks for swipe move, release and completed swipe events.
- The modal backdrop, overlay color and opacity are configurable via props.

---

## Contributors

<table>
    <tbody>
        <tr>
            <td align="center">
                <a href="https://github.com/phattran1201">
                    <img src="https://avatars.githubusercontent.com/u/36856455" width="100;" alt="phattran1201"/>
                    <br />
                    <sub><b>Harold Tran</b></sub>
                </a>
            </td>
        </tr>
    </tbody>
</table>
