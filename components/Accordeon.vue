<template>
	<v-expansion-panel>
		<v-expansion-panel-content>
			<template slot="header">
				<div align="center">{{ title }}</div>
			</template>
			<v-card>
				<slot name="body"/>
			</v-card>
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>

<script>
export default {
	name: 'Accordeon',
	props: {
		title: {
			type: String,
			default: '',
		},
	}
};
</script>

<style scoped>

</style>