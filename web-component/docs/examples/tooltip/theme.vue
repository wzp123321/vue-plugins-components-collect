<template>
  <te-tooltip content="Top center" placement="top">
    <te-button>Dark</te-button>
  </te-tooltip>
  <te-tooltip content="Bottom center" placement="bottom" effect="light">
    <te-button>Light</te-button>
  </te-tooltip>

  <te-tooltip content="Bottom center" effect="customized">
    <te-button>Customized theme</te-button>
  </te-tooltip>
</template>

<style>
.te-popper.is-customized {
  /* Set padding to ensure the height is 32px */
  padding: 6px 12px;
  background: linear-gradient(90deg, rgb(159, 229, 151), rgb(204, 229, 129));
}

.te-popper.is-customized .te-popper__arrow::before {
  background: linear-gradient(45deg, #b2e68d, #bce689);
  right: 0;
}
</style>
