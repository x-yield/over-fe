<template>
	<v-toolbar class="mb-2">
		<v-toolbar-title class="headline font-weight-bold">Overload</v-toolbar-title>
		<v-sheet color="transparent">
			<!--<v-sparkline-->
				<!--:smooth="0"-->
				<!--:gradient="['#f72047', '#ffd200', '#62ea3f']"-->
				<!--:lineWidth="1"-->
				<!--:value="value"-->
				<!--autoDraw-->
				<!--:autoDrawDuration="500"-->
				<!--gradientDirection="top"-->
				<!--strokeLinecap="round"-->
				<!--height="40"-->
				<!--width="200"-->
			<!--/>-->
		</v-sheet>
		<v-spacer/>
		<v-toolbar-items class="hidden-sm-and-down">
			<v-btn flat href="/">Jobs</v-btn>
			<v-btn flat href="/collections">Collections</v-btn>
			<v-btn flat href="/ammo">Ammo</v-btn>
		</v-toolbar-items>
	</v-toolbar>
</template>

<script>

export default {
	name: 'AppHeader',
	data() {
		return {
			value: [40, 0, 100, 0, 9, 99, 26, 22, 26, 45, 29, 99, 99, 50, 17, 26, 70, 5, 0, 68],
		};
	}
};
</script>

<style scoped>

</style>
