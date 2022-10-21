import Decimal from 'decimal.js';

function getPixelDiagonal(colPixelSpacing, rowPixelSpacing) {
  if (colPixelSpacing && rowPixelSpacing) {
    return new Decimal(colPixelSpacing ** 2 + rowPixelSpacing ** 2).sqrt();
  }

  return Decimal.sqrt(2);
}

function roundValueBasedOnUncertainty(inputValue, uncertaintyValue) {
  const valueToBeRounded = new Decimal(inputValue);
  const roundingRange = getRoundingRange(uncertaintyValue);

  if (!valueToBeRounded || !roundingRange) {
    return;
  }

  return uncertaintyValue < 1
    ? valueToBeRounded.toFixed(roundingRange)
    : valueToBeRounded.toNearest(roundingRange);
}

function getIndexOfFirstSignificantDigit(uncertaintyValue) {
  return Decimal.ceil(-Decimal.log10(uncertaintyValue));
}

function getRoundingRange(uncertaintyValue) {
  if (uncertaintyValue < 1) {
    const indexOfFirstSignificantDigit = getIndexOfFirstSignificantDigit(
      uncertaintyValue
    );
    const firstSignificantDigit = uncertaintyValue
      .toString()
      .charAt(indexOfFirstSignificantDigit.plus(1));

    return firstSignificantDigit < 3
      ? parseInt(indexOfFirstSignificantDigit.plus(1), 10)
      : parseInt(indexOfFirstSignificantDigit, 10);
  }
  const uncertaintyWholePart = uncertaintyValue.toString().split('.')[0];
  const uncertaintyWholePartFirstDigit =
    uncertaintyWholePart[0] < 3
      ? uncertaintyWholePart.length - 2
      : uncertaintyWholePart.length - 1;

  return Decimal.pow(10, uncertaintyWholePartFirstDigit);
}

function getGenericRounding(inputValue) {
  if (!inputValue) {
    return;
  }

  const absoluteInputValue = Decimal.abs(inputValue) || false;
  const valueToBeRounded = new Decimal(inputValue);

  if (absoluteInputValue <= 1.5) {
    return valueToBeRounded.toDecimalPlaces(3).toNumber() || 0;
  } else if (absoluteInputValue > 1.5 && absoluteInputValue < 10) {
    return valueToBeRounded.toDecimalPlaces(2).toNumber() || 0;
  } else if (absoluteInputValue >= 10 && absoluteInputValue <= 100) {
    return valueToBeRounded.toDecimalPlaces(1).toNumber() || 0;
  }

  return valueToBeRounded.toNearest(1).toNumber() || 0;
}

function roundUncertainty(uncertainty) {
  if (!uncertainty) {
    return;
  }

  return (
    new Decimal(roundValueBasedOnUncertainty(uncertainty, uncertainty)) || 0
  );
}

function roundArea(area, uncertainty) {
  if (!area || !uncertainty) {
    return;
  }

  return new Decimal(roundValueBasedOnUncertainty(area, uncertainty)) || 0;
}

export {
  roundValueBasedOnUncertainty,
  getPixelDiagonal,
  getIndexOfFirstSignificantDigit,
  getRoundingRange,
  getGenericRounding,
  roundUncertainty,
  roundArea,
};
