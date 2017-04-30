export default function (value, precision) {
  const multiplier = Math.pow(10, precision);


  return (Math.round(value * multiplier) / multiplier);
}
