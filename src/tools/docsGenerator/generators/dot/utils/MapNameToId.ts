/**
 * Map package or folder name to a unique, non-spaced ID that can be used in dot file.
 */
export class MapNameToId {
  private mapNameToId = new Map<string, number>();
  // must be 1-based, since is used to get next graphviz color:
  private nextId = 1;

  getId(name: string): string {
    if (!this.hasId(name)) {
      this.mapNameToId.set(name, this.nextId++);
    }

    const num = this.mapNameToId.get(name)!;

    return `P${num}`;
  }

  getIdOrThrow(name: string): string {
    if (!this.hasId(name)) {
      throw new Error(`cannot find name in map: '${name}'`);
    }

    return this.getId(name);
  }

  getNumberOrThrow(name: string): number {
    if (!this.hasId(name)) {
      throw new Error(`cannot find name in map: '${name}'`);
    }

    return this.mapNameToId.get(name)!;
  }

  hasId(name: string): boolean {
    return this.mapNameToId.has(name);
  }
}
