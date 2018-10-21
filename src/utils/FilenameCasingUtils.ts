import { Casing } from "../model/FilenamesRuleConfig";

export namespace FilenameCasingUtils {
  export function isCased(filename: string, casing: Casing): boolean {
    if (hasInvalidChars(filename)) {
      return false;
    }

    switch (casing) {
      case Casing.CamelCase:
        return isCamelCased(filename);
      case Casing.KebabCase:
        return isKebabCased(filename);
      case Casing.PascalCase:
        return isPascalCased(filename);
      case Casing.SnakeCase:
        return isSnakeCased(filename);
      default:
        throw new Error(`unhandled casing ${casing}`);
    }
  }

  function hasInvalidChars(filename: string): boolean {
    return /[^a-z^A-Z^0-9._/.-]+/.test(filename);
  }

  function isPascalCased(name: string): boolean {
    return isUpperCase(name[0]) && !name.includes("_") && !name.includes("-");
  }

  function isCamelCased(name: string): boolean {
    return isLowerCase(name[0]) && !name.includes("_") && !name.includes("-");
  }

  function isNotSeparatorCased(
    name: string,
    disallowedSeparator: string
  ): boolean {
    for (let i = 0; i < name.length; i++) {
      const c = name.charAt(i);
      if (c === disallowedSeparator || !isLowerCase(c)) {
        return false;
      }
    }
    return true;
  }

  function isKebabCased(name: string): boolean {
    return isNotSeparatorCased(name, "_") && name.includes("-");
  }

  function isSnakeCased(name: string): boolean {
    return isNotSeparatorCased(name, "-") && name.includes("_");
  }

  function isUpperCase(str: string): boolean {
    return str === str.toUpperCase();
  }

  function isLowerCase(str: string): boolean {
    return str === str.toLowerCase();
  }
}
