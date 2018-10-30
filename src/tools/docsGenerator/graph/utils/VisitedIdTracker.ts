/**
 * Track visited IDs to avoid circular references causing an infinite loop!
 */
export class VisitedIdTracker {
  private visitedIds: Map<string, boolean> = new Map<string, boolean>();

  isVisitedOrAdd(id: string): boolean {
    if (this.visitedIds.has(id)) {
      return true;
    }

    this.visitedIds.set(id, true);

    return false;
  }
}
