<template>
	<div class="table-info">
		<h4 align="center">{{ title }}</h4>
		<table class="table table-sm table-hover" >
			<tbody>
				<tr v-if="content[value]" v-for="(value, key) in headers" :key="key">
					<td align="center">{{ key }}</td>
					<td align="center"> {{ content[value] }} </td>
				</tr>
				<tr v-if="isCollection">
					<td align="center">Latest jobs for this collection</td>
					<td align="center">
						<a :href='"/job?id="+job.id' v-for="job in content.latestJobs" :key="job.id">
							{{ job.id }}
						</a>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
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
			type: Object,
			default: null,
		},
		content: {
			type: Object,
			default: null,
		},
		isCollection: {
			type: Boolean,
			default: false
		}
	}
};
</script>


<style>
	.table-info {
		background-color: white;
	}

</style>