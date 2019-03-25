<template>
	<div
		align="left"
		@click="toggleAccordeonVisibility">
		<span class="resources-util-link">{{ title }}</span>
		<div class="resources-graphs-arrow" :class="{ expanded: isVisible}"/>
	</div>
</template>

<script>
export default {
	name: 'Accordeon',
	props: {
		title: {
			type: String,
			default: ''
		},
		isVisible: {
			type: Boolean,
			default: false
		},
	},
	methods: {
		toggleAccordeonVisibility() {
			this.$emit('toggleAccordeonVisibility');
		}
	}
};
</script>

<style scoped>
	.resources-util-link {
		font-size: 18px;
		font-weight: bold;
		border-bottom: 1px black dotted;
		margin: 5px 0 0 18px;
		cursor:pointer;
	}

	.resources-graphs-arrow {
		display: inline-block;
		cursor: pointer;
		border: solid #000;
		border-width: 3px 0 0 3px;
		width: 12px;
		height: 12px;
		margin-left: 5px;
		transform: rotate(-135deg);
	}

	.resources-graphs-arrow.expanded {
		border-width: 0 3px 3px 0;
	}

</style>