<template>
	<footer class="mw-footer citizen-footer">
		<div class="citizen-footer__container">
			<section class="citizen-footer__content">
				<div class="citizen-footer__siteinfo">
					<div id="footer-sitetitle" class="mw-wiki-title">Bestiary Builder</div>
					<p id="footer-desc">Welcome to Bestiary Builder</p>
				</div>
				<!--<nav id="footer-places">
					<ul>
						<li id="footer-places-privacy">
							<a href="https://github.com/Stevnbak/Bestiary-Builder" title="Edit on Github">Edit on Github<font-awesome-icon icon="fa-brands fa-github" /></a>
						</li>
					</ul>
				</nav>-->
				<nav id="footer-places">
					<ul>
						<li id="footer-places-privacy">
							<a href="/privacy-policy" title="Privacy policy">Privacy Policy<font-awesome-icon icon="fa-solid fa-user-lock" /></a>
						</li>
						<li id="footer-places-terms">
							<a href="/terms-and-conditions" title="Terms And Conditions">Terms And Conditions<font-awesome-icon icon="fa-solid fa-scale-balanced" /></a>
						</li>
						<li id="footer-places-discord">
							<a href="/privacy-policy" title="Discord">Discord<font-awesome-icon icon="fa-brands fa-discord" /></a>
						</li>
					</ul>
				</nav>
			</section>
			<section class="citizen-footer__bottom"></section>
		</div>
	</footer>
</template>
<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
	name: "Footer",
	data: () => ({} as {}),
	async mounted() {}
});
</script>
<style scoped lang="less">
.citizen-footer {
	padding: var(--space-xl) var(--padding-page);
	background-color: var(--color-surface-2);
	clear: both;
	color: var(--color-base--subtle);
	direction: ltr;
	font-size: 0.875rem;

	&__container {
		width: 100%;
		//margin-right: var(--space-md);
		//margin-left: var(--space-md);
	}

	&__content,
	&__bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		width: 100%;
		padding: var(--space-md) 0;
		gap: var(--space-md);
	}

	&__bottom {
		border-top: 1px solid var(--border-color-base);
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
