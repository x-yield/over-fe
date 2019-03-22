<!--Компонент для отрисовки данных по конкретному элементу - коллекции или по джобе, таблица без заголовков-->
<!--Принимает на вход название, объект заголовков где ключ - желаемое название на фронте,
значение - ключ в джейсоне из бэка; и сам джейсон с данными.
Если это коллекция - в таблице добавляется дополнительный столбец, содержащий ссылку -->
<template>
	<div class="table-info">
		<h4 align="center">{{ title }}</h4>
		<table class="table table-sm table-hover" >
			<tbody>
				<!--Оправдано, так как рисуем только строку, которой пришло значение с бэка-->
				<tr v-if="content[value]" v-for="(value, key) in headers" :key="key">
					<td align="center">{{ key }}</td>
					<td align="center" v-if="value !== 'testStop' && value !== 'testStart'"> {{ content[value] }} </td>
					<td align="center" v-else> {{ tsToDate(content[value]) }} </td>
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
	},
	methods: {
		tsToDate: function(ts) {
			const from_ts = new Date(ts * 1000);

			const from_ts_hour = from_ts.getHours();

			const from_ts_min = from_ts.getMinutes() < 10 ? '0' + from_ts.getMinutes() : from_ts.getMinutes();

			const from_ts_sec = from_ts.getSeconds() < 10 ? '0' + from_ts.getSeconds() : from_ts.getSeconds();

			const from_ts_year = from_ts.getFullYear();

			if (isNaN(from_ts.getDate())) {
				return 'not yet received';
			} else {
				const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

				const month = months[from_ts.getMonth()];

				const date = from_ts.getDate();

				return date + ' ' + month + ' ' + from_ts_year + ' ' + from_ts_hour + ':' + from_ts_min + ':' + from_ts_sec;
			}
		},
	}
};
</script>


<style>
	.table-info {
		background-color: white;
	}

</style>