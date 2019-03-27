<template>
	<v-card md12 xs12>
		<iframe
			:src="content"
			class="iframe-graphs"
			scrolling="No"
		/>
	</v-card>
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
		height: 300%;
		overflow: hidden;
		border: none;
	}

</style>