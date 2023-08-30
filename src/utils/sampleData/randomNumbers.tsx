export function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function round(num: number, decimal_places: number) {
  return parseFloat(num.toFixed(decimal_places));
}

export function getRandomFloat(
  min: number,
  max: number,
  decimal_places: number = 2
) {
  if (decimal_places === 0) {
    return Math.random() * (max - min) + min;
  } else {
    return round(Math.random() * (max - min) + min, decimal_places);
  }
}
