// lib/formatters.ts

export const formatPriceUI = (price: number): string => {
  // We check if the number is an integer (e.g., 79 or 79.00—for JS, it's the same thing)
  if (Number.isInteger(price)) {
    return price.toString();
  }

  // If there are cents, we force 2 decimal places and replace the period with a comma.
  return price.toFixed(2).replace(".", ",");
};
