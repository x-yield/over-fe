<!--Добавляем, когда во всех табдицах появится пагинация-->
<!--Компонент для отрисовки данных таблица-список, в которую получаем список одинаковых сущностей-->
<!--Принимает на вход название, объект заголовков где ключ - желаемое название на фронте,
значение - ключ в джейсоне из бэка; и сам джейсон с данными. -->
<template>
	<v-card class="justify-space-between">
		<v-data-table
			:headers="headers"
			:items="content"
			:totalItems="pagination.totalItems"
			:pagination.sync="pagination"
			:loading="loading"
			:rowsPerPageItems="[25]"
			sortIcon=""
			hideActions>
			<template slot="items" slot-scope="props">
				<td class="text-lg-center body-2">
					<a :href='"/collection?id="+props.item.id'>{{ props.item.id }}</a>
				</td>
				<td class="text-lg-center body-2">{{ props.item.author }}</td>
				<td class="text-lg-center body-2">{{ props.item.env }}</td>
				<td class="text-lg-center body-2">{{ props.item.project }}</td>
				<td class="text-lg-center body-2">{{ props.item.service }}</td>
				<td class="text-lg-center body-2">{{ props.item.name }}</td>
				<td class="text-lg-center body-2">{{ props.item.ref }}</td>
				<td class="text-lg-center body-2">
					<a :href='"/job?id="+job.id' v-for="job in props.item.latestJobs" :key="job.id" class="mr-2">
						{{ job.id }}
					</a>
				</td>
			</template>
		</v-data-table>
		<div class="text-xs-center pt-2">
			<v-pagination
				color="cyan darken-1"
				totalVisible="7"
				v-model="pagination.page"
				:length="pages"
				@input="filterTable({env, project, name})"/>
		</div>
	</v-card>
</template>

<script>
export default {
	name: 'TableList',
	props: {
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
		},
		loading: {
			type: Boolean,
			default: false,
		},
		pagination: {
			type: Object,
			default: null,
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
		},
		filterTable(params) {
			this.$emit('filterTable', params);
		}
	},
};
</script>

<style scoped>

</style>