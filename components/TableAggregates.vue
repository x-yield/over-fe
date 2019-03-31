<!--Компонент для отрисовки данных таблица с сортировкой и скрытыми элементами-->
<!--Принимает на вход название, объект заголовков где ключ - желаемое название на фронте,
значение - ключ в джейсоне из бэка; объект с аккумулированными данными и объект с деталлизированными данными-->
<template>
	<v-card class="justify-space-between">
		<v-data-table
			v-if="isOverall"
			:headers="headers"
			:items="commonAggregates"
			sortIcon=""
			hideActions>
			<template slot="items" slot-scope="props">
				<tr>
					<td
						class="text-lg-center body-2 plus-table-label"
						@click="toggleVisibility"
						:class="{ expanded: overallCodeVisibility }">Overall</td>
					<td class="text-lg-center body-2">{{ props.item.okCount }}</td>
					<td class="text-lg-center body-2">{{ props.item.errCount }}</td>
					<td class="text-lg-center body-2">{{ props.item.q50 }}</td>
					<td class="text-lg-center body-2">{{ props.item.q75 }}</td>
					<td class="text-lg-center body-2">{{ props.item.q90 }}</td>
					<td class="text-lg-center body-2">{{ props.item.q95 }}</td>
					<td class="text-lg-center body-2">{{ props.item.q98 }}</td>
					<td class="text-lg-center body-2">{{ props.item.q99 }}</td>
				</tr>
				<tr
					v-show="overallCodeVisibility"
					v-for="aggregate in detailedAggregates"
					:key="aggregate.responseCode"
					class="hidden-rows">
					<td class="text-lg-center body-2">{{ aggregate.responseCode }}</td>
					<td class="text-lg-center body-2">{{ aggregate.okCount }}</td>
					<td class="text-lg-center body-2">{{ aggregate.errCount }}</td>
					<td class="text-lg-center body-2">{{ aggregate.q50 }}</td>
					<td class="text-lg-center body-2">{{ aggregate.q75 }}</td>
					<td class="text-lg-center body-2">{{ aggregate.q90 }}</td>
					<td class="text-lg-center body-2">{{ aggregate.q95 }}</td>
					<td class="text-lg-center body-2">{{ aggregate.q98 }}</td>
					<td class="text-lg-center body-2">{{ aggregate.q99 }}</td>
				</tr>
			</template>
			<template slot="no-data">
				<v-alert :value="true" color="amber" icon="warning">
					There're no aggregates for this job
				</v-alert>
			</template>
		</v-data-table>
		<v-data-table
			v-else
			:headers="headers"
			:items="commonAggregates"
			hideActions
			:customSort="customSort">
			<template slot="items" slot-scope="props">
				<tr>
					<td
						class="text-lg-center body-2 plus-table-label"
						@click.stop="toggleResponseCodeVisibility(props.item.label)"
						:class="{ expanded: openedTag.includes(props.item.label) }">{{ props.item.label }}</td>
					<td class="text-lg-center body-2">{{ props.item.okCount }}</td>
					<td class="text-lg-center body-2">{{ props.item.errCount }}</td>
					<td class="text-lg-center body-2">{{ props.item.q50 }}</td>
					<td class="text-lg-center body-2">{{ props.item.q75 }}</td>
					<td class="text-lg-center body-2">{{ props.item.q90 }}</td>
					<td class="text-lg-center body-2">{{ props.item.q95 }}</td>
					<td class="text-lg-center body-2">{{ props.item.q98 }}</td>
					<td class="text-lg-center body-2">{{ props.item.q99 }}</td>
				</tr>
				<template v-if="openedTag.includes(code.label)" v-for="code in detailedAggregates">
					<tr :key="code.responseCode" v-if="code.label === props.item.label" class="hidden-rows">
						<td class="text-lg-center body-2">{{ code.responseCode }}</td>
						<td class="text-lg-center body-2">{{ code.okCount }}</td>
						<td class="text-lg-center body-2">{{ code.errCount }}</td>
						<td class="text-lg-center body-2">{{ code.q50 }}</td>
						<td class="text-lg-center body-2">{{ code.q75 }}</td>
						<td class="text-lg-center body-2">{{ code.q90 }}</td>
						<td class="text-lg-center body-2">{{ code.q95 }}</td>
						<td class="text-lg-center body-2">{{ code.q98 }}</td>
						<td class="text-lg-center body-2">{{ code.q99 }}</td>
					</tr>
				</template>
			</template>
			<template slot="no-data">
				<v-alert :value="true" color="amber" icon="warning">
					There're no detailed aggregates for this job
				</v-alert>
			</template>
		</v-data-table>
	</v-card>
</template>

<script>
export default {
	name: 'TableAggregates',
	props: {
		title: {
			type: String,
			default: 'Caption'
		},
		headers: {
			type: Array,
			default: null,
		},
		commonAggregates: {
			type: Array,
			default: null,
		},
		detailedAggregates: {
			type: Array,
			default: null,
		},
		isOverall: {
			type: Boolean,
			default: true
		},
		currentSort: {
			type: String,
			default: ''
		},
		currentSortDir: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			overallCodeVisibility: false,
			openedTag: [],
			isDesc: true
		};
	},
	methods: {
		toggleVisibility: function() {
			this.overallCodeVisibility = !this.overallCodeVisibility;
		},
		toggleResponseCodeVisibility(name) {
			const index = this.openedTag.indexOf(name);

			if (index > -1) {
				this.openedTag.splice(index, 1);
			} else {
				this.openedTag.push(name);
			}
		},
		sortAggregates(items, index, currentSortDir) {
			if (index === 'label') {
				if (currentSortDir !== 'dsc') {
					console.log('hru');
					this.$emit('sortAggregates', index);
				}
			}
			return items;
		},
		customSort(items, index, isDesc) {
			items.sort((a, b) => {
				if (!isDesc) {
					return a[index] < b[index] ? -1 : 1;
				} else {
					return b[index] < a[index] ? -1 : 1;
				}
			});
			return items;
		}
	},
};
</script>

<style scoped>
	.arrow-table-sort.asc{
		margin-left: 5px;
		display: inline-block;
		border-left: 7px solid transparent;
		border-right: 7px solid transparent;
		border-bottom: 8px solid #31b131;
	}

	.arrow-table-sort.dsc {
		margin-left: 5px;
		display: inline-block;
		border-left: 7px solid transparent;
		border-right: 7px solid transparent;
		border-top: 8px solid #31b131;
	}
	.plus-table-label:after {
		height: 14px;
		width: 14px;
		margin-left: 3px;
		box-sizing: content-box;
		display: inline-block;
		vertical-align: middle;
		color: white;
		border: 1px solid white;
		border-radius: 18px;
		box-shadow: 0 0 3px #444;
		text-align: center;
		text-indent: 0 !important;
		font-family: 'Courier New', Courier, monospace;
		line-height: 14px;
		background-color: #31b131;
		content: '+';
	}

	.plus-table-label.expanded:after {
		height: 14px;
		width: 14px;
		margin-left: 3px;
		box-sizing: content-box;
		display: inline-block;
		vertical-align: middle;
		color: white;
		border: 1px solid white;
		border-radius: 18px;
		box-shadow: 0 0 3px #444;
		text-align: center;
		text-indent: 0 !important;
		font-family: 'Courier New', Courier, monospace;
		line-height: 14px;
		background-color: #D85B5B;
		content: '-';
	}

	.hidden-rows {
		background-color: #F0EDED;
	}

</style>