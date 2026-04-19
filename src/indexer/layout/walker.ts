export function findByName<T, P>(
  key: string,
  name: string,
  parent: P,
  root: unknown
): { parent: P; element: T }[] {
  const result: { parent: P; element: T }[] = [];

  const innerWalk = (node: unknown) => {
    if (Array.isArray(node)) {
      for (const item of node) {
        innerWalk(item);
      }
      return;
    }

    if (node && typeof node === 'object') {
      const obj = node as Record<string, unknown>;

      const candidate = obj[key];
      if (Array.isArray(candidate)) {
        for (const element of candidate as T[]) {
          if (element && (element as any).name === name) {
            result.push({ parent, element });
          }
          innerWalk(element);
        }
      }

      for (const otherKey of Object.keys(obj)) {
        if (otherKey === key) {
          continue;
        }
        const value = obj[otherKey];
        if (value && typeof value === 'object') {
          innerWalk(value);
        }
      }
    }
  };

  innerWalk(root);

  return result;
}

export function collectAll<T, P>(
  key: string,
  parent: P,
  root: unknown
): { parent: P; element: T }[] {
  const result: { parent: P; element: T }[] = [];

  const innerWalk = (node: unknown) => {
    if (Array.isArray(node)) {
      for (const item of node) {
        innerWalk(item);
      }
      return;
    }

    if (node && typeof node === 'object') {
      const obj = node as Record<string, unknown>;

      const candidate = obj[key];
      if (Array.isArray(candidate)) {
        for (const element of candidate as T[]) {
          result.push({ parent, element });
          innerWalk(element);
        }
      }

      for (const otherKey of Object.keys(obj)) {
        if (otherKey === key) {
          continue;
        }
        const value = obj[otherKey];
        if (value && typeof value === 'object') {
          innerWalk(value);
        }
      }
    }
  };

  innerWalk(root);

  return result;
}
