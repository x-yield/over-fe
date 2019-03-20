<template>
	<table class="table table-sm table-bordered" >
		<caption>Last tests</caption>
		<thead>
			<tr>
				<th scope="col" class="text-center">Test id</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td align="center">mde
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script>
export default {
	name: 'Table',
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
		},
	}
};
</script>


<style>

</style>