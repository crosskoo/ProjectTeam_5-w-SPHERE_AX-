<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style lang="scss">
@import '@/assets/styles/variables.scss';

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  background-color: var(--background1);
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
