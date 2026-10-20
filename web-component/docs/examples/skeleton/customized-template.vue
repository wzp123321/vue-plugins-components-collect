<template>
  <te-skeleton style="width: 240px">
    <template #template>
      <te-skeleton-item variant="image" style="width: 240px; height: 240px" />
      <div style="padding: 14px">
        <te-skeleton-item variant="p" style="width: 50%" />
        <div
          style="
            display: flex;
            align-items: center;
            justify-items: space-between;
          "
        >
          <te-skeleton-item variant="text" style="margin-right: 16px" />
          <te-skeleton-item variant="text" style="width: 30%" />
        </div>
      </div>
    </template>
  </te-skeleton>
</template>
