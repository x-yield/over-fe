<template>
	<select class="dropbtn" v-model="model">
		<option value="">All</option>
		<option v-for="(model, index) in array" :key="index">
			{{ model }}
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

	.flush {
		color: white;
		background: linear-gradient(#6bbdff, #007bff);
		border: solid 2px #007bff;
		font-weight: bold;
	}
</style>