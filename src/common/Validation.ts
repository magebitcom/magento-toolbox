export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export default class Validation {
  public static readonly MODULE_NAME_REGEX = /^[A-Z][a-z0-9]*_[A-Z][a-z0-9]*$/;
  public static readonly CLASS_NAME_REGEX = /^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*$/;
  public static readonly SNAKE_CASE_REGEX = /^[a-z0-9_]+$/;

  public static isValidModuleName(name: string): ValidationResult {
    if (!Validation.MODULE_NAME_REGEX.test(name)) {
      return {
        isValid: false,
        errors: ['Module name must be in format "Vendor_Module"'],
      };
    }

    return { isValid: true };
  }

  public static isValidClassName(name: string): ValidationResult {
    if (!Validation.CLASS_NAME_REGEX.test(name)) {
      return { isValid: false, errors: ['Class name must be in format "ClassName"'] };
    }

    return { isValid: true };
  }

  public static isSnakeCase(name: string): ValidationResult {
    if (!Validation.SNAKE_CASE_REGEX.test(name)) {
      return { isValid: false, errors: ['Name must be in snake_case format'] };
    }

    return { isValid: true };
  }
}
