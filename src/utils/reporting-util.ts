import { async } from './ts-util';

export function WithReporting(overrideClassName?: string): ClassDecorator {
  return (target: Function) => {
    const className = overrideClassName || target.name.replace(/[^a-zA-Z]/g, '');

    for (const propertyName of Object.getOwnPropertyNames(target.prototype)) {
      const descriptor = Object.getOwnPropertyDescriptor(
        target.prototype,
        propertyName
      );

      if (!descriptor || typeof descriptor.value !== 'function') {
        continue;
      }

      const originalMethod = descriptor.value;

      if (originalMethod.constructor.name === 'AsyncFunction') {
        descriptor.value = async function (...args: any[]) {
          const [res, err] = await async(originalMethod.apply(this, args));
          if (!!err) {
            console.log(`[${className}.${propertyName}] Error:`, {
              error: err,
              calledWith: JSON.stringify(args, null, 1),
            });
            throw err;
          }
          console.log(`[${className}.${propertyName}] Success:`, {
            result: JSON.stringify(res, null, 1),
            calledWith: JSON.stringify(args, null, 1),
          });
          return res;
        };
      } else {
        descriptor.value = function (...args: any[]) {
          try {
            const res = originalMethod.apply(this, args);
            console.log(`[${className}.${propertyName}] Success:`, {
              result: JSON.stringify(res, null, 1),
              calledWith: JSON.stringify(args, null, 1),
            });
            return res;
          } catch (err: any) {
            console.log(`[${className}.${propertyName}] Error:`, {
              error: err,
              calledWith: JSON.stringify(args, null, 1),
            });
            throw err;
          }
        };
      }

      Object.defineProperty(target.prototype, propertyName, descriptor);
    }
  };
}
