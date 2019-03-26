<template>
	<div>
		<h4 align="right">
			<v-btn
				@click.once="stopTest"
				v-show="status !== 'finished'"
				color="red darken-1"
				:disabled="status === 'stopped'">
				STOP TEST
			</v-btn>
			<img
				v-if="hasCollections"
				alt="edit"
				width="35px"
				height="40px"
				src="~/assets/icons/regression.png"
				@click="toggleModalVisibility('collectionsListVisibility')"
			/>
			<img
				v-if="hasKubeInfo"
				alt="edit"
				width="40px"
				height="40px"
				src="~/assets/icons/kubernetes.png"
				@click="toggleModalVisibility('kubernetesInfoVisibility')"
			/>
			<img
				alt="edit"
				width="30px"
				height="30px"
				src="~/assets/icons/edit.png"
				@click="toggleModalVisibility('editorVisibility')"
			/>
			<img
				alt="delete"
				width="30px"
				height="30px"
				src="~/assets/icons/delete.png"
				@click="deleteJob"
			/>
		</h4>
	</div>
</template>

<script>
export default {
	name: 'PanelItem',
	props: {
		status : {
			type: String,
			default: 'shoot',
		},
		hasCollections : {
			type: Boolean,
			default: false,
		},
		hasKubeInfo : {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			visibilities:{
				editorVisibility: false,
				kubernetesInfoVisibility: false,
				collectionsListVisibility: false,
			},
		};
	},
	methods: {
		toggleModalVisibility: function(param) {
			this.$emit('toggleModalVisibility', param);
		},
		stopTest: function() {
			this.jobUpdateBuffer.status = 'stopped';
			this.updateJob();
		},
	}
};
</script>

<style scoped>
@import '../node_modules/@ozonui/color-palette/index.css';

.panel-item {
	display: flex;
	flex: 1;
	justify-content: center;
	width:100%;
	padding: 10px 0;
}

</style>