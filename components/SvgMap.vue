<template>
	<div id="map-container"/>
</template>

<script>

global.jQuery = require('jquery');
const $ = global.jQuery;

export default {
	data: function() {
		return {
			svg_path: null,
			svg: null,
			floor: 42,
		};
	},
	created() {
	},
	mounted() {
		this.svg_path = require('assets/vector_moscow_c_'+this.floor+'.svg');
		let obj = document.createElement('object');

		obj.data = this.svg_path;
		obj.id = 'interactive_map';
		obj.type = 'image/svg+xml';
		obj.width = '170%';
		obj.onload = () => {
			this.svg = obj.getSVGDocument();
			const elements = $('path', this.svg);
			const main = this;

			$.each(elements, function(idx, elem) {
				if ($(elem).attr('inkscape:label') === '#workplace') {
					$(elem).click(main.workplaceInfoShow);
				}
			});

			this.recolorTakenPlaces();
		};
		document.getElementById('map-container').appendChild(obj);
	},
	methods: {
		workplaceInfoShow: function(event) {
			this.$store.commit('staff/setLoading');
			this.$store.dispatch('staff/showProfileByWorkplace', event.target.id);
		},
		recolorTakenPlaces: function() {
			this.$api.get('/map/taken_workplaces/'+this.floor)
				.then(response => {
					if (response[1]) {
						// TODO error handling console.log('error getting taken workplaces');
					} else {
						this.$store.commit('staff/setTakenWorkplaces', response[0].data.ids);
						return response[0].data.ids;
					}
				})
				.then(ids => {
					const svg = this.svg;

					ids.forEach(function(item) {
						const taken_place = $('#' + item, svg);

						if (taken_place) {
							taken_place.css('fill', '#a0f0f0');
						}
					});
				});
		},
	}
};
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
  margin-bottom: -2px; /* yes, I'm that particular about formatting */
}
</style>