type TypeWithId = {
  id: string;
};

export namespace ArrayUtils {
  export function removeFrom(arr: TypeWithId[], item: TypeWithId) {
    const index = arr.findIndex(n => n.id === item.id);

    if (index >= 0) {
      arr.splice(index, 1);
    }
  }
}
