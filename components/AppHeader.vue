<template>
	<v-toolbar color="cyan lighten-1">
		<router-link to="/" style="color: black; text-decoration: none;">
			<v-toolbar-title class="headline font-weight-bold">Overload</v-toolbar-title>
		</router-link>
		<v-spacer/>
		<v-toolbar-items class="hidden-sm-and-down">
			<v-btn flat href="/">Jobs</v-btn>
			<v-btn flat href="/collections">Collections</v-btn>
			<v-btn flat href="/ammo">Ammo</v-btn>
			<v-btn flat href="/firestarter">Firestarter</v-btn>
		</v-toolbar-items>
	</v-toolbar>
</template>

<script>

export default {
	name: 'AppHeader',
};
</script>

<style scoped>

</style>
