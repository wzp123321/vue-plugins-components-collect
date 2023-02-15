<template>
  <div class="cf-dice">
    <div class="cf-dice-item dice-first">
      <div class="dice-container">
        <span class="dice-circle"></span>
      </div>
    </div>

    <div class="cf-dice-item dice-second">
      <div class="dice-container">
        <div>
          <span class="dice-circle"></span>
        </div>
        <div>
          <span class="dice-circle"></span>
        </div>
      </div>
    </div>

    <div class="cf-dice-item dice-third">
      <div class="dice-container">
        <div>
          <span class="dice-circle"></span>
        </div>
        <div>
          <span class="dice-circle"></span>
        </div>
        <div>
          <span class="dice-circle"></span>
        </div>
      </div>
    </div>

    <div class="cf-dice-item dice-four">
      <div class="dice-container">
        <div>
          <span class="dice-circle"></span>
          <span class="dice-circle"></span>
        </div>
        <div>
          <span class="dice-circle"></span>
          <span class="dice-circle"></span>
        </div>
      </div>
    </div>

    <div class="cf-dice-item dice-five">
      <div class="dice-container">
        <div>
          <span class="dice-circle"></span>
          <span class="dice-circle"></span>
        </div>
        <div>
          <span class="dice-circle"></span>
        </div>
        <div>
          <span class="dice-circle"></span>
          <span class="dice-circle"></span>
        </div>
      </div>
    </div>

    <div class="cf-dice-item dice-six">
      <div class="dice-container">
        <div>
          <span class="dice-circle"></span>
          <span class="dice-circle"></span>
        </div>
        <div>
          <span class="dice-circle"></span>
          <span class="dice-circle"></span>
        </div>
        <div>
          <span class="dice-circle"></span>
          <span class="dice-circle"></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
.cf-dice {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  row-gap: 24px;

  .cf-dice-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    padding: 16px;

    &.dice-first .dice-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    &.dice-second .dice-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      span {
        display: inline-block;
      }

      > div:last-child {
        display: flex;
        flex-direction: column;

        justify-content: flex-end;
      }
    }

    &.dice-third .dice-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      div:nth-child(2) {
        text-align: center;
      }

      div:nth-child(3) {
        text-align: right;
      }
    }

    &.dice-four .dice-container,
    &.dice-five .dice-container,
    &.dice-six .dice-container {
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      div {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      }
    }
  }

  .dice-container {
    width: 120px;
    height: 120px;

    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 4px;

    .dice-circle {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.65);
    }
  }
}
</style>
