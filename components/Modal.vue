<template>
	<v-dialog v-model="modalIsVisible" :maxWidth="width">
		<v-card>
			<v-card-title>
				<span class="subheading font-weight-bold">{{ title }}</span>
			</v-card-title>
			<v-card-text>
				<v-container class="grid-list-md">
					<v-layout wrap>
						<v-flex>
							<slot name="body"/>
						</v-flex>
					</v-layout>
				</v-container>
			</v-card-text>
			<v-card-actions>
				<v-spacer/>
				<v-btn v-if="isEditor" color="blue darken-1" flat @click="save">Save</v-btn>
				<v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>


<script>
export default {
	name: 'Modal',
	props: {
		title: {
			type: String,
			default: '',
		},
		width: {
			type: String,
			default: '400px'
		},
		modalIsVisible: {
			type: Boolean,
			default: false,
		},
		isEditor: {
			type: Boolean,
			default: false,
		}
	},
	methods: {
		close() {
			this.$emit('close');
		},
		save() {
			this.$emit('saveEditedInfo');
		},
	}
};
</script>


<style>
</style>