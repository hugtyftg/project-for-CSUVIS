import styled from '@emotion/styled';
export const S = {
  GraphContainer: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: var(--border-radius-normal);
    box-sizing: border-box;
  `,
  Title: styled.h2`
    padding-top: var(--gap-alg-title);
  `,
  LayoutInfoContainer: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--gap-info);
    margin: 10px;
  `,
  MetricContainer: styled.div<{ visible: boolean }>`
    width: 100%;
    visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  `,
  PrimaryBtn: styled.button<{ bgColor: string }>`
    background-color: ${(props) => props.bgColor || 'lightblue'};
  `,
};
