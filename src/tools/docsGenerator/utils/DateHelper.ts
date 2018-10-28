export namespace DateHelper {
  export function nowHumanReadable(): string {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    };
    const today = new Date();

    return today.toLocaleDateString(undefined, options);
  }
}
