// * Assume n is a positive integer, if n is less than 1, return 0

const sum_to_n_a = function (n) {
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new TypeError('Input must be an integer');
  }
  if (n < 1) {
    return 0;
  }
  return (n * (n + 1)) / 2;
};

const sum_to_n_b = function (n) {
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new TypeError('Input must be an integer');
  }
  if (n < 1) {
    return 0;
  }
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

const sum_to_n_c = function (n) {
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new TypeError('Input must be an integer');
  }
  if (n < 1) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  return n + sum_to_n_c(n - 1);
};
