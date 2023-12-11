<template>
	<div class="header-outer mw-header citizen-header">
		<div class="header-item" v-tooltip.right="{content: 'Bestiary Builder'}">
			<a href="/">
				<img src="../assets/logo.svg" />
			</a>
		</div>
		<RouterLink v-for="route in $router.options.routes.filter((a: any) => a.navbar)" :to="route.path" class="navlink center">
			<div class="header-item" v-tooltip.right="route.name" v-html="route.meta?.icon"></div>
		</RouterLink>
	</div>
</template>
<script lang="ts" setup>
import {RouterLink, RouterView} from "vue-router";
</script>
<style scoped lang="less">
.citizen-header {
	--header-icon-size: ~"calc( var( --header-button-size ) / 2 )";
	--header-button-size: ~"calc( var( --header-size ) - var(  --space-xs ) * 2 )";
	--header-direction: row;
	display: flex;
	flex-direction: var(--header-direction);
	padding: var(--space-xs);
	border-top: 1px solid var(--border-color-base);
	background-color: var(--color-surface-0);
	gap: var(--space-xxs);
	justify-content: space-between;
	align-items: center;

	&__item {
		display: flex;
		align-items: center;
	}

	&__button {
		display: grid;
		width: var(--header-button-size);
		height: var(--header-button-size);
		border-radius: var(--border-radius--small);
		contain: strict;
		place-items: center;

		// Used in checkbox hack
		&Checkbox {
			position: absolute;
			display: block;
			width: inherit;
			height: inherit;
			contain: strict;
		}

		// Pure CSS icons
		&Icon {
			overflow: hidden; // Sometimes CSS animation can clip
			width: var(--header-icon-size);
			height: var(--header-icon-size);
			contain: strict;
		}

		&Icon,
		.citizen-ui-icon:before {
			opacity: var(--opacity-icon-base);
			transition: transform 250ms cubic-bezier(0.215, 0.61, 0.355, 1), opacity 100ms ease;
		}

		&:hover {
			background-color: var(--background-color-quiet--hover);

			.citizen-ui-icon:before,
			.citizen-header__buttonIcon {
				opacity: var(--opacity-icon-base--hover);
			}
		}

		&:active {
			background-color: var(--background-color-quiet--active);

			.citizen-ui-icon:before,
			.citizen-header__buttonIcon {
				opacity: var(--opacity-icon-base--active);
			}
		}
	}

	&__logo {
		padding: 0 var(--space-xs) 0 0;
		border-right: 1px solid var(--border-color-base);
		margin: 0 var(--space-xxs);
	}

	&__inner {
		z-index: -1; // Inner element should be behind menu and search
		display: flex;
		min-width: 0;
		flex-direction: var(--header-direction);
		flex-grow: 1;
		justify-content: space-between;
		gap: var(--space-xxs);

		.mw-checkbox-hack-checkbox:checked {
			~ .citizen-header__button {
				background-color: var(--background-color-primary--active);
			}
		}
	}

	&__start,
	&__end {
		display: flex;
		flex-direction: var(--header-direction);
		gap: var(--space-xxs);
	}

	&__start {
		min-width: 0;
		align-items: center;
	}

	// Reset
	ul {
		margin: 0;
		list-style: none;
	}
}

.navlink {
	display: flex;
	justify-content: center;
	align-items: center;
}

.header-outer {
	display: flex;
	flex-direction: column;
	gap: var(--space-xs);

	width: 100%;
	flex-direction: row;
	justify-content: space-between;

	.header-item {
		height: calc(1.2 * var(--space-xl));
		aspect-ratio: 1 / 1;

		a,
		span {
			height: 100%;
			width: 100%;
			margin: auto;
			display: block;

			&:hover {
				background-color: var(--color-surface-1);
				border-radius: var(--border-radius--small);
			}
		}

		div svg {
			scale: 0.6;
			aspect-ratio: 1 / 1;
			fill: var(--color-base);

			margin: auto;
			display: block;
		}
	}
}

// Reset hover styles if it is a touch device
// This is dumb but hover:hover overrides active states
@media (hover: none) {
	.citizen-header {
		&__button {
			&:hover {
				background-color: none;

				.citizen-header__buttonIcon {
					opacity: var(--opacity-icon-base);
				}
			}
		}
	}
}

@media (min-width: 1000px) {
	.citizen-header {
		--header-direction: column;
		border-top: 0;
		padding: var(--space-sm);
		position: sticky;
		top: 3.5dvh;

		&__logo {
			padding: 0 0 var(--space-xs) 0;
			border-right: 0;
			border-bottom: 1px solid var(--border-color-base);
			margin: var(--space-xxs) 0;
		}
	}

	.header-outer {
		flex-direction: column;
		width: unset;
		justify-content: start;
	}

	.header-outer:first-of-type > div.header-item:first-of-type {
		border-bottom: 1px solid var(--border-color-base);
	}
}

/* Hide header when scroll down on smaller screen sizes */
@media (max-width: 720px) {
	.citizen-header {
		transition: transform 250ms cubic-bezier(0.215, 0.61, 0.355, 1);
	}

	.citizen-scroll--down .citizen-header {
		transform: translateY(100%);
	}
}
</style>
