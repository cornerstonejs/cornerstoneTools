// Taken from MIT OSS lib - https://github.com/tuzz/n-dimensional-flood-fill
// Refactored to ES6.

export default function(options) {
  const { getter, seed } = options;
  const onFlood = options.onFlood || function() {};
  const onBoundary = options.onBoundary || function() {};
  const equals = options.equals || defaultEquals;
  const diagonals = options.diagonals || false;
  const startNode = get(seed);
  const permutations = prunedPermutations();
  const stack = [];
  const flooded = [];
  const visits = {};
  const bounds = {};

  stack.push({ currentArgs: seed });

  while (stack.length > 0) {
    flood(stack.pop());
  }

  return {
    flooded,
    boundaries: boundaries(),
  };

  function flood(job) {
    const getArgs = job.currentArgs;
    const prevArgs = job.previousArgs;

    if (visited(getArgs)) {
      return;
    }
    markAsVisited(getArgs);

    if (member(getArgs)) {
      markAsFlooded(getArgs);
      pushAdjacent(getArgs);
    } else {
      markAsBoundary(prevArgs);
    }
  }

  function visited(key) {
    return visits[key] === true;
  }

  function markAsVisited(key) {
    visits[key] = true;
  }

  function member(getArgs) {
    const node = safely(get, [getArgs]);

    return safely(equals, [node, startNode]);
  }

  function markAsFlooded(getArgs) {
    flooded.push(getArgs);
    onFlood.apply(undefined, getArgs);
  }

  function markAsBoundary(prevArgs) {
    bounds[prevArgs] = prevArgs;
    onBoundary.apply(undefined, prevArgs);
  }

  function pushAdjacent(getArgs) {
    for (let i = 0; i < permutations.length; i += 1) {
      const perm = permutations[i];
      const nextArgs = getArgs.slice(0);

      for (let j = 0; j < getArgs.length; j += 1) {
        nextArgs[j] += perm[j];
      }

      stack.push({
        currentArgs: nextArgs,
        previousArgs: getArgs,
      });
    }
  }

  function get(getArgs) {
    return getter.apply(undefined, getArgs);
  }

  function safely(f, args) {
    try {
      return f.apply(undefined, args);
    } catch (error) {
      return;
    }
  }

  function prunedPermutations() {
    const permutations = permute(seed.length);

    return permutations.filter(function(perm) {
      const count = countNonZeroes(perm);
      return count !== 0 && (count === 1 || diagonals);
    });
  }

  function permute(length) {
    const perms = [];

    const permutation = function(string) {
      return string.split('').map(function(c) {
        return parseInt(c, 10) - 1;
      });
    };

    for (let i = 0; i < Math.pow(3, length); i += 1) {
      const string = lpad(i.toString(3), '0', length);
      perms.push(permutation(string));
    }

    return perms;
  }

  function boundaries() {
    const array = [];

    for (let key in bounds) {
      if (bounds.hasOwnProperty(key)) {
        array.unshift(bounds[key]);
      }
    }

    return array;
  }
}

function defaultEquals(a, b) {
  return a === b;
}

function countNonZeroes(array) {
  let count = 0;

  for (let i = 0; i < array.length; i += 1) {
    if (array[i] !== 0) {
      count += 1;
    }
  }

  return count;
}

function lpad(string, character, length) {
  const array = new Array(length + 1);
  const pad = array.join(character);
  return (pad + string).slice(-length);
}
