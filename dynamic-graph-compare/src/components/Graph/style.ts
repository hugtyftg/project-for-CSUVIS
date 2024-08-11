import styled from '@emotion/styled';
import { css } from '@emotion/react';
export const S = {
  GraphContainer: styled.div<{ width: number; height: number }>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
  `,
  GraphContainer2: (width: number, height: number) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${width}px;
    height: ${height}px;
  `,
};
