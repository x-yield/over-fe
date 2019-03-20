<template>
	<table class="table table-sm table-hover" >
		<tbody>
			<tr v-for="header in headers" :key="header">
				<td align="center">{{ header }}</td>
				<td align="center">{{ mde }}</td>
			</tr>
		</tbody>
	</table>
</template>

<script>
export default {
	name: 'TableInfo',
	props: {
		title: {
			type: String,
			default: 'Title',
		},
		headers: {
			type: Array,
			default: null,
		},
		content: {
			type: Object,
			default: null,
		}
	}
};
</script>


<style>

</style>