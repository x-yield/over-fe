<template>
	<div class="staff-panel" :class="$attrs.class" :style="$attrs.style">
		<div class="staff-panel-heading">
			<h1>
				<slot />
			</h1>
		</div>
		<div class="divider"/>
		<div class="panel-items-wrapper">
			<Item
				:key="item.key"
				v-for="item in items"
			>
				<a :href="item.path">{{ item.value }}</a>
			</Item>
		</div>
	</div>
</template>

<script>
import Heading from '@ozonui/heading';
import Item from './PanelItem';

export default {
	props: {
		items: {
			type: Array,
			default: () => []
		}
	},
	components: {
		Heading,
		Item
	}
};
</script>

<style scoped>
@import "@ozonui/color-palette";

.staff-panel {
	height: 100vh;
	width: 200px;
	display: flex;
	flex-direction: column;
	border-right: 2px solid;
	border-right-color: var(--ui-color-muted-2);
}

.staff-panel-heading {
	display: flex;
	justify-content: center;
	margin: 10px 0;
}

.divider {
	width: 100%;
	height: 1px;
	max-height: 1px;
	background-color: var(--ui-color-muted-2);
}

.panel-items-wrapper {
	display: flex;
	flex-direction: column;
}
</style>
