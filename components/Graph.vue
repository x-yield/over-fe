<template>
	<iframe
		:src="content"
		class="iframe-graphs"
		scrolling="No"
	/>
</template>

<script>
export default {
	name: 'Graph',
	props: {
		content: {
			type: String,
			default: '',
		}
	}
};
</script>

<style scoped>
	.iframe-graphs {
		width: 100%;
		height: 100%;
		overflow: hidden;
		border: none;
	}

</style>