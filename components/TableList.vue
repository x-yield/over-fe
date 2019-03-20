<template>
	<table class="table table-sm table-bordered" >
		<caption>{{ caption }}</caption>
		<thead>
			<tr>
				<th v-for="header in headers" :key="header" scope="col" class="text-center">{{ header }}</th>
			</tr>
		</thead>
		<tbody v-if="isJobs">
			<tr v-for="job in content" :key="job.id">
				<td align="center">
					<a :href='"/job?id="+job.id'>{{ job.id }}</a>
				</td>
				<td align="center">
					{{ job.author }}
				</td>
				<td align="center" :class="{active: isInProgress(job.status), warning: !isInProgress(job.status)}">
					{{ job.status }}
				</td>
				<td align="center">
					{{ tsToDate(job.testStart) }} → {{ tsToDate(job.testStop) }}
				</td>
				<td align="center">
					{{ job.target }}
				</td>
				<td align="center">
					{{ job.description }}
				</td>
			</tr>
		</tbody>
		<tbody v-else>
			<tr v-for="collection in content" :key="collection.id">
				<td align="center">
					<a :href='"/collection?id="+collection.id'>{{ collection.id }}</a>
				</td>
				<td align="center">
					{{ collection.author }}
				</td>
				<td align="center">
					{{ collection.env }}
				</td>
				<td align="center">
					{{ collection.project }}
				</td>
				<td align="center">
					{{ collection.service }}
				</td>
				<td align="center">
					{{ collection.name }}
				</td>
				<td align="center">
					{{ collection.ref }}
				</td>
				<td align="center">
					<a :href='"/job?id="+job.id' v-for="job in collection.latestJobs" :key="job.id">
						{{ job.id }}
					</a>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script>
export default {
	name: 'TableList',
	props: {
		caption: {
			type: String,
			default: 'Caption'
		},
		headers: {
			type: Array,
			default: null,
		},
		content: {
			type: Array,
			default: null,
		},
		isJobs: {
			type: Boolean,
			default: true
		}
	},
	methods: {
		tsToDate: function(ts) {
			const from_ts = new Date(ts * 1000);

			const today = new Date();

			const from_ts_hour = from_ts.getHours();

			const from_ts_min = from_ts.getMinutes() < 10 ? '0' + from_ts.getMinutes() : from_ts.getMinutes();

			const from_ts_sec = from_ts.getSeconds() < 10 ? '0' + from_ts.getSeconds() : from_ts.getSeconds();

			const from_ts_year = from_ts.getFullYear();

			if (isNaN(from_ts.getDate())) {
				return 'not yet';
			}
			else if (today.getDate() === from_ts.getDate()) {
				return from_ts_hour + ':' + from_ts_min;
			}
			else if (today.getFullYear() === from_ts_year) {
				const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

				const month = months[from_ts.getMonth()];

				const date = from_ts.getDate();

				return date + ' ' + month + ' ' + from_ts_hour + ':' + from_ts_min + ':' + from_ts_sec;
			}
			else {
				const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

				const month = months[from_ts.getMonth()];

				const date = from_ts.getDate();

				return date + ' ' + month + ' ' + from_ts_year + ' ' + from_ts_hour + ':' + from_ts_min + ':' + from_ts_sec;
			}
		},
		isInProgress: function(status) {
			if (status !== 'finished') {
				return false;
			}
			else {
				return true;
			}
		}
	}
};
</script>

<style scoped>

</style>