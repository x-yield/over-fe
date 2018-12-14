<template>
	<div class="panel-item" :class="$attrs.class" :style="$attrs.style">
		<slot />
	</div>
</template>

<style scoped>
@import "@ozonui/color-palette";

.panel-item {
	display: flex;
	flex: 1;
	justify-content: center;
	width:100%;
	padding: 10px 0;
}

.panel-item:hover {
	background-color: var(--ui-color-active);
	color:  var(--typography-white);
}
</style>