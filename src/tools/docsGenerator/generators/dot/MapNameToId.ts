/**
 * Map package or folder name to a unique, non-spaced ID that can be used in dot file.
 */
export class MapNameToId {
  private mapNameToId = new Map<string, string>();
  private nextId = 1;

  getId(name: string): string {
    if (!this.hasId(name)) {
      this.mapNameToId.set(name, `P${this.nextId++}`);
    }

    return this.mapNameToId.get(name)!;
  }

  getIdOrThrow(name: string): string {
    if (!this.hasId(name)) {
      throw new Error(`cannot find name in map: '${name}'`);
    }

    return this.getId(name);
  }

  hasId(name: string): boolean {
    return this.mapNameToId.has(name);
  }
}
