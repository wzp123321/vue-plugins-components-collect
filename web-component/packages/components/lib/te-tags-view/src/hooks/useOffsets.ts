import type { Ref } from 'vue';
import { ref, watchEffect } from 'vue';
import type { TagSizeMap, TagOffsetMap, Tag, TagOffset } from '../types';

const DEFAULT_SIZE = { width: 0, left: 0 };

export default function useOffsets(
  tags: Tag[],
  tabSizes: Ref<TagSizeMap>,
  // holderScrollWidth: Ref<number>,
): Ref<TagOffsetMap> {
  const offsetMap = ref<TagOffsetMap>(new Map());
  watchEffect(() => {
    const map: TagOffsetMap = new Map();
    const tagsValue = tags;
    const lastOffset =
      tabSizes.value.get(tagsValue[0]?.name as string) || DEFAULT_SIZE;
    const rightOffset = lastOffset.left + lastOffset.width;

    for (let i = 0; i < tagsValue.length; i += 1) {
      const { name } = tagsValue[i];
      let data = tabSizes.value.get(name as string);

      // Reuse last one when not exist yet
      if (!data) {
        data =
          tabSizes.value.get(tagsValue[i - 1]?.name as string) || DEFAULT_SIZE;
      }

      const entity = (map.get(name as string) || { ...data }) as TagOffset;

      // Right
      entity.right = rightOffset - entity.left - entity.width;

      // Update entity
      map.set(name as string, entity);
    }
    offsetMap.value = new Map(map);
  });

  return offsetMap;
}
