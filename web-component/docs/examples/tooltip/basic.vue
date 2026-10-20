<template>
  <div class="tooltip-base-box">
    <div class="row center">
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Top Left prompts info"
        placement="top-start"
      >
        <te-button>top-start</te-button>
      </te-tooltip>
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Top Center prompts info"
        placement="top"
      >
        <te-button>top</te-button>
      </te-tooltip>
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Top Right prompts info"
        placement="top-end"
      >
        <te-button>top-end</te-button>
      </te-tooltip>
    </div>
    <div class="row">
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Left Top prompts info"
        placement="left-start"
      >
        <te-button>left-start</te-button>
      </te-tooltip>
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Right Top prompts info"
        placement="right-start"
      >
        <te-button>right-start</te-button>
      </te-tooltip>
    </div>
    <div class="row">
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Left Center prompts info"
        placement="left"
      >
        <te-button class="mt-3 mb-3">left</te-button>
      </te-tooltip>
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Right Center prompts info"
        placement="right"
      >
        <te-button>right</te-button>
      </te-tooltip>
    </div>
    <div class="row">
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Left Bottom prompts info"
        placement="left-end"
      >
        <te-button>left-end</te-button>
      </te-tooltip>
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Right Bottom prompts info"
        placement="right-end"
      >
        <te-button>right-end</te-button>
      </te-tooltip>
    </div>
    <div class="row center">
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Bottom Left prompts info"
        placement="bottom-start"
      >
        <te-button>bottom-start</te-button>
      </te-tooltip>
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Bottom Center prompts info"
        placement="bottom"
      >
        <te-button>bottom</te-button>
      </te-tooltip>
      <te-tooltip
        class="box-item"
        effect="dark"
        content="Bottom Right prompts info"
        placement="bottom-end"
      >
        <te-button>bottom-end</te-button>
      </te-tooltip>
    </div>
  </div>
</template>

<style>
.tooltip-base-box {
  width: 600px;
}
.tooltip-base-box .row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tooltip-base-box .center {
  justify-content: center;
}
.tooltip-base-box .box-item {
  width: 110px;
  margin-top: 10px;
}
</style>
