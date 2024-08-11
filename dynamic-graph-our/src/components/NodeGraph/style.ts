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
  `,
  Title: styled.h2`
    padding: var(--gap-alg-title) 0;
  `,
  LayoutInfoContainer: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--gap-info);
    margin: 20px;
  `,
  MetricContainer: styled.div<{ visible: boolean }>`
    width: 100%;
    visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  `,
};
