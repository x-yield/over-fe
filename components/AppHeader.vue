<template>
	<div class="header header--extended">
		<div
			v-if="hasLogoSlot"
			class="header__logo">
			<a class="navbar-brand" href="/">Overload</a>
		</div>
		<div
			v-if="hasNavSlot || isNavigationLinksPassed"
			class="header__nav">
			<template v-if="hasNavSlot">
				<slot name="nav"/>
			</template>
			<template v-else>
				<div
					v-for="link in navigationLinks"
					:key="link.title"
					class="header__nav__item">
					<nuxt-link
						:to="link.to"
						class="header__nav__item-link"
						exact-active-class="header__nav__item-link--active">
						{{ link.title }}
					</nuxt-link>
				</div>
			</template>
		</div>
		<div
			v-if="hasActionsSlot"
			class="header__actions">
			<slot name="actions"/>
		</div>
	</div>
</template>

<script>

export default {
	name: 'AppHeader',
	props: {
		navigationLinks: {
			type: Array,
			default: null
		},
	},
	watch: {
		'$route': {
			handler(newRoute) {
				if (newRoute) {
					this.toggleShowMenu(true);
				}
			},
			deep: true
		}
	},
	computed: {
		isNavigationLinksPassed() {
			return this.navigationLinks && this.navigationLinks.length;
		},
		hasLogoSlot() {
			return !!this.$slots.logo;
		},
		hasNavSlot() {
			return !!this.$slots.nav;
		},
		hasActionsSlot() {
			return !!this.$slots.actions;
		}
	}
};
</script>

<style scoped>
	.header {
		top: 0;
		width: 100%;
		background: var(--secondary-font-color);
		min-height: 70px;
		max-height: 70px;
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		padding: 0 var(--padding-xlarge);
		position: sticky;
		z-index: 9999;
		left: 0;
		box-shadow: 0px 1px 10px rgba(0,0,0,.1);
	}

	.header--extended {
		box-shadow: unset;
		border-bottom: 1px solid var(--shadow-color);
	}

	.header__logo {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.header__nav {
		display: flex;
		justify-content: flex-start;
		align-items: stretch;
		padding: 0 calc(var(--padding-xlarge) * 2);
		flex: 1;
	}

	.header__nav__item {
		display: flex;
		align-items: stretch;
	}

	.header__nav__item-link {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 var(--padding-main);
		text-decoration: none;
		position: relative;
		color: var(--main-font-color-light);
		font-weight: 600;
		transition: color .2s ease-in;
	}

	.header__nav__item-link:hover, .header__nav__item-link--active {
		color: var(--main-font-color);
	}

	.header__nav__item-link--active::after {
		position: absolute;
		content: '';
		width: 100%;
		height: 3px;
		background: var(--main-block-color);
		bottom: 0;
		left: 0;
	}

	@media (max-width: 768px) {
		.header__nav {
			position: fixed;
			padding: 0;
			width: 100%;
			height: calc(100% - 70px);
			flex-direction: column;
			align-items: flex-start;
			bottom: 0;
			left: 0;
			background: #fafafa;
			transition: transform .4s cubic-bezier(0.4, 0.0, 0.2, 1);
			transform: translateX(-100%);
		}

		.header__nav--visible {
			transform: translateX(0);
		}

		.header__nav__item {
			width: 100%;
		}

		.header__nav__item-link {
			width: 100%;
			padding: var(--padding-xlarge);
		}

		.header__nav__item-link--active {
			background: #ebe9e9;
		}
	}

	.header__actions {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
