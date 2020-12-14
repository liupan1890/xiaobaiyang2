<template>
  <div>
    <button
      class="py-2 px-4 rounded bg-green-500 hover:bg-green-400 text-white transition duration-200 ease-out"
      v-bind="$attrs"
    >
      <slot />
    </button>

    <a-button> 搜索 </a-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'VButton',
  inheritAttrs: false,
})
</script>
