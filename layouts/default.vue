<template>
	<div class="overload-layout-default">
		<div class="overload-app">
			<nuxt/>
		</div>
	</div>
</template>

<script>

import 'vuetify/dist/vuetify.min.css';

export default {
	components: {
	}
};
</script>

<style scoped>
@import "@ozonui/color-palette";

.overload-layout-default {
	display: flex;
	width: 100%;
	height: 100%;
	position: relative;
}

.overload-app {
	flex: 1;
	margin: 20px;
}

.build-info {
	position: absolute;
	bottom: 0;
	right: 0;
	color: var(--ui-color-gray);
}
</style>

<style>
@import "@ozonui/color-palette"; /*fix this shit pls*/

html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}
</style>
