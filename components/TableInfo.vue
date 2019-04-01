<!--Компонент для отрисовки данных по конкретному элементу - коллекции или по джобе, таблица без заголовков-->
<!--Принимает на вход название, объект заголовков где ключ - желаемое название на фронте,
значение - ключ в джейсоне из бэка; и сам джейсон с данными.
Если это коллекция - в таблице добавляется дополнительный столбец, содержащий ссылку -->
<template>
	<v-card class="justify-space-between pt-2">
		<h3 align="center">{{ title }}</h3>
		<v-data-table
			:items="content"
			hideActions
			hideHeaders>
			<template slot="items" slot-scope="props">
				<tr v-if="props.item[value]" v-for="(value, key) in headers" :key="key">
					<td align=center class="body-2 font-weight-bold">{{ key }}</td>
					<td align=center class="body-2">{{ checkKey(value, props.item[value]) }}</td>
					<td v-if="!isCollection" class="justify-center layout px-0">
						<v-icon small class="mr-2" @click="editItem(key, value, props.item[value])">edit</v-icon>
					</td>
				</tr>
				<slot name="extra-link" v-if="isCollection"/>
			</template>
		</v-data-table>
	</v-card>
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
			type: Array,
			default: null,
		},
		isCollection: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		editItem(jobParamHeader, jobParamKey, jobParamValue) {
			this.$emit('editItem', jobParamHeader, jobParamKey, jobParamValue);
		},
		checkKey(key, value) {
			switch (key) {
				case 'testStart':
				case 'testStop':
				case 'autostopTime':
					return this.tsToDate(value);
				default:
					return value;
			}
		},
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
</style>