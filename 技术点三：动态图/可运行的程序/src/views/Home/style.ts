import styled from '@emotion/styled';
export const S = {
  Container: styled.div`
    width: 100vw;
    height: 100vh;
    padding: var(--gap-grid);
    margin: auto;
    display: grid;
    gap: var(--gap-grid);
    grid-template-columns: auto 1fr;
    grid-template-rows: 200px 120px 1fr;
    box-sizing: border-box;
  `,
  TitleContainer: styled.div`
    grid-column: 1;
    grid-row: 1;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    h1 {
      text-align: center;
      font-size: 38px;
    }
  `,
  FunctionContainer: styled.div`
    grid-column: 1;
    grid-row: 2;
    background-color: white;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    border-radius: var(--border-radius-normal);
  `,
  OurAlgContainer: styled.div`
    grid-column: 1;
    grid-row: 3;
  `,
  CompareAlgContainer: styled.div`
    grid-column: 2;
    grid-row: 1 / span 3;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: var(--gap-grid);
  `,
};
