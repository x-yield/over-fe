<template>
	<table id="StatsOverall" class="hover table table-bordered">
		{{ currentSort }}
		{{ currentSortDir }}
		<thead>
			<tr v-if="isOverall">
				<th v-for="(value, key) in headers" :key="value">{{ key }}</th>
			</tr>
			<tr v-else>
				<th v-for="(value, key) in headers" :key="value" @click="sortAggregates('value')">{{ key }}
					<div v-if="value === currentSort" class="arrow-table-sort" :class="currentSortDir === 'asc' ? 'asc' : 'dsc'"/>
				</th>
			</tr>
		</thead>
		<tbody v-if="isOverall">
			<tr v-for="overall in commonAggregates" :key="overall.label">
				<td @click="toggleVisibility" class="plus-table-label" :class="{ expanded: overallCodeVisibility }">Overall
				</td>
				<td>{{ overall.okCount }}</td>
				<td>{{ overall.errCount }}</td>
				<td>{{ overall.q50 }}</td>
				<td>{{ overall.q75 }}</td>
				<td>{{ overall.q90 }}</td>
				<td>{{ overall.q95 }}</td>
				<td>{{ overall.q98 }}</td>
				<td>{{ overall.q99 }}</td>
			</tr>
			<tr v-show="overallCodeVisibility" v-for="aggregate in detailedAggregates" :key="aggregate.responseCode" class="hidden-rows">
				<td>{{ aggregate.responseCode }}</td>
				<td>{{ aggregate.okCount }}</td>
				<td>{{ aggregate.errCount }}</td>
				<td>{{ aggregate.q50 }}</td>
				<td>{{ aggregate.q75 }}</td>
				<td>{{ aggregate.q90 }}</td>
				<td>{{ aggregate.q95 }}</td>
				<td>{{ aggregate.q98 }}</td>
				<td>{{ aggregate.q99 }}</td>
			</tr>
		</tbody>
		<tbody v-else>
			<template v-for="tag in sortedAggregates" >
				<tr :key="tag.label">
					<td @click.stop="toggleResponseCodeVisibility(tag.label)" class="plus-table-label" :class="{ expanded: openedTag.includes(tag.label) }">{{ tag.label }}</td>
					<td>{{ tag.okCount }}</td>
					<td>{{ tag.errCount }}</td>
					<td>{{ tag.q50 }}</td>
					<td>{{ tag.q75 }}</td>
					<td>{{ tag.q90 }}</td>
					<td>{{ tag.q95 }}</td>
					<td>{{ tag.q98 }}</td>
					<td>{{ tag.q99 }}</td>
				</tr>
				<template v-if="openedTag.includes(code.label)" v-for="code in detailedAggregates">
					<tr :key="code.responseCode" v-if="code.label === tag.label" class="hidden-rows">
						<td>{{ code.responseCode }}</td>
						<td>{{ code.okCount }}</td>
						<td>{{ code.errCount }}</td>
						<td>{{ code.q50 }}</td>
						<td>{{ code.q75 }}</td>
						<td>{{ code.q90 }}</td>
						<td>{{ code.q95 }}</td>
						<td>{{ code.q98 }}</td>
						<td>{{ code.q99 }}</td>
					</tr>
				</template>
			</template>
		</tbody>
	</table>
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
			type: Object,
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
		}
	},
	data() {
		return {
			overallCodeVisibility: false,
			currentSort: 'label',
			currentSortDir: 'asc',
			openedTag: [],
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
		sortAggregates: function(s) {
			if (s === this.currentSort) {
				this.currentSortDir = this.currentSortDir === 'asc' ? 'dsc' : 'asc';
			}
			this.currentSort = s;
		},
	},
	computed: {
		sortedAggregates:function() {
			return this.commonAggregates.slice().sort((a, b) => {
				let modifier =1;

				if (this.currentSortDir === 'dsc') {modifier = -1;}
				if (a[this.currentSort] < b[this.currentSort]) {return -1 * modifier;}
				if (a[this.currentSort] > b[this.currentSort]) {return modifier;}
				return 0;
			});
		}
	}
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