function useDatasetName(defaultDataset: string) {
  const datasetName = localStorage.getItem('datasetName') ?? defaultDataset;
  const setDatasetName: any = (newData: any) => {
    localStorage.setItem('datasetName', newData);
    // eslint-disable-next-line no-restricted-globals
    location.reload();
  };
  return [datasetName, setDatasetName];
}
export default useDatasetName;
