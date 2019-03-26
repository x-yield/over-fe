<!--Компонент для отрисовки данных таблица-список, в которую получаем список одинаковых сущностей-->
<!--Принимает на вход название, объект заголовков где ключ - желаемое название на фронте,
значение - ключ в джейсоне из бэка; и сам джейсон с данными.
Если это коллекция - в таблице добавляется дополнительный столбец, содержащий ссылку -->
<template>
	<v-card v-if="isJobs" class="justify-space-between">
		<v-data-table
			:headers="headers"
			:items="content"
			:totalItems="totalContent"
			:pagination.sync="pagination"
			:loading="loading"
			:rowsPerPageItems="[50, 100, 150]">
			<template slot="items" slot-scope="props">
				<td class="text-md-right body-2">
					<a :href='"/job?id="+props.item.id'>{{ props.item.id }}</a>
				</td>
				<td class="text-lg-right body-2">{{ props.item.author }}</td>
				<td class="text-lg-right body-2">{{ props.item.status }}</td>
				<td class="text-lg-right body-2">{{ tsToDate(props.item.testStart) + '→' + tsToDate(props.item.testStop) }}</td>
				<td class="text-lg-right body-2">{{ props.item.target }}</td>
				<td class="text-lg-right body-2">{{ props.item.description }}</td>
			</template>
		</v-data-table>
	</v-card>
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
		totalContent: {
			type: Number,
			default: 0,
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
			default: null
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