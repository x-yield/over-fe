<template>
	<select class="dropbtn" v-model="model">
		<option value="">All</option>
		<option v-if="model !== 'project'" v-for="(model, index) in array" :key="index">
			{{ model }}
		</option>
		<option v-else v-for="(model, index) in array" :key="index" :value="model.projectId">
			{{ model.projectId }}
			<span v-if="model.projectName">({{ model.projectName }})</span>
		</option>
	</select>

</template>

<script>
export default {
	name: 'DropdownMenu',
	props: {
		model: {
			type: String,
			default: 'env'
		},
		array: {
			type: Array,
			default: null,
		}
	}
};
</script>

<style scoped>
	.dropbtn {
		background-color: white;
		color: black;
		font-size: 16px;
		border: solid 2px #007bff;
		border-radius: 5px;
		width: auto;
		cursor: pointer;
	}

</style>