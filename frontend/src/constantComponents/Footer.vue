<template>
	<footer class="mw-footer citizen-footer">
		<div class="citizen-footer__container">
			<section class="citizen-footer__content">
				<div class="citizen-footer__siteinfo">
					<div id="footer-sitetitle" class="mw-wiki-title">Bestiary Builder</div>
					<p id="footer-desc">Welcome to Bestiary Builder</p>
				</div>
				<nav id="footer-places">
					<ul>
						<li id="footer-places-privacy">
							<a href="https://thecyclefrontier.wiki/wiki/Wiki:Privacy_policy" title="Wiki:Privacy policy">Privacy policy<font-awesome-icon icon="fa-user-lock" /></a>
						</li>
					</ul>
				</nav>
				<nav id="footer-places">
					<ul>
						<li id="footer-places-privacy">
							<a href="https://github.com/Stevnbak/Bestiary-Builder" title="Edit on Github">Edit on Github<font-awesome-icon icon="fa-brands fa-github" /></a>
						</li>
					</ul>
				</nav>
			</section>
			<section class="citizen-footer__bottom">
			</section>
		</div>
	</footer>
</template>
<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
	name: "Footer",
	data() {
		return {
			META: {} as any
		};
	},
	async mounted() {
		async function get_meta_data() {
			const response = await fetch("https://raw.githubusercontent.com/TCF-Wiki/TCF-Information/main/META.json", {});
			const json = await response.json();

			return json;
		}

		const META = await get_meta_data();
		this.META = META;
	}
});
</script>
<style scoped lang="less">
.citizen-footer {
	padding: var(--space-xl) var(--padding-page);
	margin-top: var(--space-xl);
	// Reserve space for header
	margin-bottom: var(--header-size);
	background-color: var(--color-surface-2);
	clear: both;
	color: var(--color-base--subtle);
	direction: ltr;
	font-size: 0.875rem;

	width: 100vw;

	&__container {
		max-width: 92vw;
		margin-right: var(--space-md);
		margin-left: var(--space-md);
	}

	&__content,
	&__bottom {
		display: flex;
		flex-wrap: wrap;
		width: 90vw;
		padding: var(--space-md) 0;
		gap: var(--space-md);
	}

	&__bottom {
		align-items: center;
		justify-content: space-between;
		border-top: 1px solid var(--border-color-base);
		margin-right: auto;
		margin-left: auto;
	}

	&__siteinfo {
		display: flex;
		max-width: 80vw;
		flex-direction: column;
		gap: var(--space-xs);

		p {
			margin: 0;
			line-height: var(--line-height);
		}
	}

	a {
		color: var(--color-base--emphasized);
		font-weight: var(--font-weight-medium);
	}

	ul {
		display: flex;
		flex-wrap: wrap;
		margin: 0;
	}

	li {
		list-style: none;
	}
}

#footer {
	&-sitetitle {
		color: var(--color-base--emphasized);
		font-size: 1.25rem;
		font-weight: 500;

		img.mw-logo-wordmark {
			max-height: 54px;
			filter: invert(1) hue-rotate(180deg);
		}
	}

	&-places {
		ul {
			flex-direction: column;
		}

		a {
			display: block;
			padding: var(--space-xs) var(--space-md);
			border-radius: var(--border-radius--small);

			&:hover {
				background-color: var(--color-surface-3);
			}

			&:active {
				background-color: var(--color-surface-3);
			}

			& svg {
				color: var(--color-base--emphasized);
				float: right;
				margin-left: 1rem;
			}
		}
	}

	&-tagline {
		padding: var(--space-xs) 0;
	}

	&-icons {
		display: flex;
		justify-content: flex-end;

		ul {
			gap: var(--space-xs);
		}

		li {
			display: flex; // Horizontally aligned with there are two icons in the same li
		}

		a {
			display: flex;
			align-items: center;
		}
	}
}

@media (min-width: 1001px) {
	.citizen-footer {
		margin-bottom: 0;
		margin-left: var(--header-size);
		width: 100vw;

		&__siteinfo {
			max-width: 40vw;
		}
	}

	#footer-sitetitle {
		font-size: 2rem;
		font-weight: 700;
	}
}
</style>
