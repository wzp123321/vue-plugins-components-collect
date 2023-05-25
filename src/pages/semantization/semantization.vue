<template>
  <div class="semantization">
    <div class="module">
      <h5 class="mb16">header标签</h5>
      <p>
        header 元素代表“网页”或“section”的页眉。
        通常包含h1-h6元素或hgroup，作为整个页面或者一个内容块的标题。也可以包裹一节的目录部分，一个搜索框，一个nav，或者任何相关logo。
      </p>
      <p>整个页面没有限制header元素的个数，可以拥有多个，可以为每个内容块增加一个header元素</p>
    </div>

    <div class="module">
      <h5 class="mb16">footer标签</h5>
      <p>
        footer元素代表“网页”或“section”的页脚，通常含有该节的一些基本信息，譬如：作者，相关文档链接，版权资料。
        如果footer元素包含了整个节，那么它们就代表附录，索引，提拔，许可协议，标签，类别等一些其他类似信息。
      </p>
    </div>

    <div class="module">
      <h5 class="mb16">hgroup元素</h5>
      <p>
        hgroup元素代表“网页”或“section”的标题，当元素有多个层级时，该元素可以将h1到h6元素放在其内，譬如文章的主标题和副标题的组合
      </p>
    </div>

    <div class="module">
      <h5 class="mb16">nav元素</h5>
      <p>nav元素代表页面的导航链接区域。用于定义页面的主要导航部分。</p>
    </div>

    <div class="module">
      <h5 class="mb16">main元素</h5>
      <p>页面主要内容，一个页面只能使用一次。如果是web应用，则包围其主要功能。</p>
    </div>

    <div class="module">
      <h5 class="mb16">article元素</h5>
      <p>定义外部的内容，其中的内容独立于文档的其余部分。</p>
    </div>

    <div class="module">
      <h5 class="mb16">section元素</h5>
      <p>定义文档中的节（section、区段）。比如章节、页眉、页脚或文档中的其他部分。</p>
    </div>

    <div class="module">
      <h5 class="mb16">aside元素</h5>
      <p>定义其所处内容之外的内容。如侧栏、文章的一组链接、广告、友情链接、相关产品列表等。</p>
    </div>

    <div class="module">
      <h5 class="mb16">small元素</h5>
      <p>呈现小号字体效果，指定细则，输入免责声明、注解、署名、版权。</p>
      <code>
        <small>测试small</small>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">strong元素</h5>
      <p>和 em 标签一样，用于强调文本，但它强调的程度更强一些。</p>
      <code>
        <strong>测试strong</strong>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">em元素</h5>
      <p>将其中的文本表示为强调的内容，表现为斜体。</p>
      <code>
        <em>测试em</em>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">mark元素</h5>
      <p>使用黄色突出显示部分文本。</p>
      <code>
        <mark>测试mark</mark>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">figure元素</h5>
      <p>规定独立的流内容（图像、图表、照片、代码等等）（默认有40px左右margin）。</p>
      <code>
        <figure>213212</figure>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">figcaption元素</h5>
      <p>定义 figure 元素的标题，应该被置于 figure 元素的第一个或最后一个子元素的位置。</p>
    </div>

    <div class="module">
      <h5 class="mb16">cite元素</h5>
      <p>表示所包含的文本对某个参考文献的引用，比如书籍或者杂志的标题。</p>
      <code>
        <cite>cccc</cite>
        <cite>cccc</cite>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">blockquoto元素</h5>
      <p>定义块引用，块引用拥有它们自己的空间。</p>
      <code>
        <blockquoto>草草草草</blockquoto>
        <blockquoto>草草草草</blockquoto>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">abbr元素</h5>
      <p>简称或缩写。</p>
      <code>
        <abbr title="简写">我在测是</abbr>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">dfn元素</h5>
      <p>定义术语元素，与定义必须紧挨着，可以在描述列表dl元素中使用。</p>
    </div>

    <div class="module">
      <h5 class="mb16">del元素</h5>
      <p>移除的内容。</p>
      <code>
        <del>我在测试移除</del>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">ins元素</h5>
      <p>添加的内容。</p>
      <code>
        <ins>我在测试添加</ins>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">code元素</h5>
      <p>标记代码。</p>
    </div>

    <div class="module">
      <h5 class="mb16">progress元素</h5>
      <p>定义运行中的进度（进程）。</p>
      <code>
        <progress value="22" max="100"></progress>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">details&summary元素</h5>
      <p>可创建一个挂件，仅在被切换成展开状态时，它才会显示内含的信息。summary元素可为该部件提供概要或者标签。</p>
      <code>
        <details>
          <summary>Details</summary>
          Something small enough to escape casual notice.
        </details>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">time元素</h5>
      <p>用来表示 24 小时制时间或者公历日期，若表示日期则也可包含时间和时区。</p>
      <code><time datetime="2001-05-15 19:00">May 15</time></code>
    </div>

    <div class="module">
      <h5 class="mb16">sub元素</h5>
      <p>下标</p>
      <code>
        我是
        <sub>sub</sub>
      </code>
    </div>

    <div class="module">
      <h5 class="mb16">sup元素</h5>
      <p>sup</p>
      <code>
        我是
        <sup>sup</sup>
      </code>
    </div>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
.semantization {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  .module {
    height: 140px;
  }
}
</style>
