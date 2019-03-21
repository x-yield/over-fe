<template>
	<table id="StatsOverall" class="hover table table-bordered">
		<thead>
			<tr>
				<th v-for="header in headers" :key="header">{{ header }}</th>
			</tr>
		</thead>
		<tbody>
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
	},
	data() {
		return {
			overallCodeVisibility: false,
		};
	},
	methods: {
		toggleVisibility: function() {
			this.overallCodeVisibility = !this.overallCodeVisibility;
		},
	}
};
</script>

<style scoped>
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