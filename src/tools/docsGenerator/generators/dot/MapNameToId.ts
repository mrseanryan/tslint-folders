/**
 * Map package or folder name to a unique, non-spaced ID that can be used in dot file.
 */
export class MapNameToId {
  private mapNameToId = new Map<string, string>();
  private nextId = 1;

  getId(name: string): string {
    if (!this.mapNameToId.has(name)) {
      this.mapNameToId.set(name, (this.nextId++).toString());
    }

    return this.mapNameToId.get(name)!;
  }
}
