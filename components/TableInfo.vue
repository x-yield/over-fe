<template>
	<table-info class="table table-sm table-bordered" >
		<t-head>
			<tr>
				<th align="center">{{ title }}</th>
			</tr>
		</t-head>
		<tbody>
			<tr v-for="header in headers" :key="header">
				<td align="center">{{ header }}</td>
				<td align="center">mde</td>
			</tr>
		</tbody>
	</table-info>
</template>

<script>
export default {
	name: 'TableInfo',
	props: {
		title: {
			type: String,
			default: 'Title',
			required: true,
		},
		headers: {
			type: Array,
			default: null,
			required: true,
		}
	}
};
</script>


<style>

</style>