import React, { PropsWithChildren } from 'react';
import { Button as TDButton } from 'tdesign-react';
interface ButtonProp extends PropsWithChildren {
  onClick: () => void;
}
export default function Button({ children, onClick }: ButtonProp) {
  return (
    <TDButton
      shape="rectangle"
      size="large"
      type="button"
      theme="default"
      variant="outline"
      onClick={onClick}
    >
      {children}
    </TDButton>
  );
}
