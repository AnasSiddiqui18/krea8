import { useSnapshot as baseSnapshot } from "valtio";

export function useSnapshot<T extends object>(store: T) {
  return baseSnapshot(store) as T;
}
