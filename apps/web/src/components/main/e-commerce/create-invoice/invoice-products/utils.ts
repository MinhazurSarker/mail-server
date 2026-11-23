export const formatCurrency = (val: number) => {
  return (
    "$" +
    val.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
};
