import styled from '@emotion/styled';
export const S = {
  Container: styled.div`
    width: 100vw;
    height: 100vh;
    padding: var(--gap-grid);
    margin: auto;
    display: grid;
    gap: var(--gap-grid);
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 180px 1fr;
    box-sizing: border-box;
  `,
  TopWrapper: styled.div`
    grid-column: 1 / span 2;
    grid-row: 1;
    display: flex;
    width: 100%;
    border-radius: var(--border-radius-normal);
    overflow: hidden;
  `,
  TitleContainer: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    h1 {
      text-align: center;
      font-size: 38px;
    }
    background-color: white;
  `,
  FunctionContainer: styled.div`
    flex: 1;
    background-color: white;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  `,
  OurAlgContainer: styled.div`
    grid-column: 1;
    grid-row: 2;
  `,
  CompareAlgContainer: styled.div`
    grid-column: 1 / span 2;
    grid-row: 2;
  `,
};
