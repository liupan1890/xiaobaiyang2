<template>
  <div class="fileactions"></div>
</template>

<script lang="ts">
  export default {
    name: 'FileActions',
    props: {
      item: {
        type: String,
        default: '',
      },
    },
  }
</script>
