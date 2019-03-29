<!--Компонент для отрисовки данных по конкретному элементу - коллекции или по джобе, таблица без заголовков-->
<!--Принимает на вход название, объект заголовков где ключ - желаемое название на фронте,
значение - ключ в джейсоне из бэка; и сам джейсон с данными.
Если это коллекция - в таблице добавляется дополнительный столбец, содержащий ссылку -->
<template>
	<v-card class="justify-space-between">
		<h3 align="center">{{ title }}</h3>
		<v-data-table
			:items="content"
			hideActions
			hideHeaders>
			<template slot="items" slot-scope="props">
				<tr v-if="props.item[value]" v-for="(value, key) in headers" :key="key">
					<td align=center class="body-2 font-weight-bold">{{ key }}</td>
					<td align=center class="body-2">{{ props.item[value] }}</td>
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
		}
	}
};
</script>


<style>
</style>