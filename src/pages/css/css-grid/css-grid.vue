<template>
  <div id="css-grid" class="css-grid">
    <h1>Grid1</h1>
    <div class="grid-warpper grid-1">
      <div class="one item">One</div>
      <div class="two item">Two</div>
      <div class="three item">Three</div>
      <div class="four item">Four</div>
      <div class="five item">Five</div>
      <div class="six item">Six</div>
    </div>

    <h1>Grid2</h1>
    <div class="grid-warpper grid-2">
      <div class="one item">One</div>
      <div class="two item">Two</div>
      <div class="three item">Three</div>
      <div class="four item">Four</div>
      <div class="five item">Five</div>
      <div class="six item">Six</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
/**
 * auto-fill 关键字：表示自动填充，让一行（或者一列）中尽可能的容纳更多的单元格。grid-template-columns: repeat(auto-fill, 200px)
 * 表示列宽是 200 px，但列的数量是不固定的，只要浏览器能够容纳得下，就可以放置元素，代码以及效果如下图所示：
 */
</script>
<style lang="less" scoped>
.css-grid {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  .grid-warpper {
    display: grid;

    .one {
      background-color: #3681ff;
    }

    .two {
      background-color: #ff9120;
    }

    .three {
      background-color: #ffcb20;
    }

    .four {
      background-color: #00b261;
    }

    .five {
      background-color: #fe4b4e;
    }

    .six {
      background-color: #443aff;
    }

    .seven {
      background-color: #a83bff;
    }

    .eight {
      background-color: #00a5b2;
    }

    .nine {
      background-color: #d91026;
    }

    .ten {
      background-color: #ec50d2;
    }
  }

  .grid-1 {
    grid-template-columns: 500px 300px 400px;
    /*  声明行间距和列间距  */
    grid-gap: 20px;
    /*  声明行的高度  */
    grid-template-rows: 100px 200px;
  }

  .grid-2 {
    grid-template-columns: repeat(auto-fill, 400px);
    /*  声明行间距和列间距  */
    grid-gap: 20px;
    /*  声明行的高度  */
    grid-auto-rows: 160px;
  }
}
</style>
