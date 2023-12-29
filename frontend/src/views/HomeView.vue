<template>
	<Breadcrumbs :routes="[
{
	path: '',
	text: 'Home',
	isCurrent: true
}
]" :isLessWide="true"/> 

	<div class="content less-wide">
		<div class="description">
			<img class="logo" src="/logo-text.svg" />
			<p>bla bla bla...</p>
		</div>
		<div class="developers">
			<h2>made by</h2>
			<div>
				<a class="person" href="https://github.com/stevnbak">
					<h3>Stevnbak</h3>
					<img src="/Stevnbak.png" />
				</a>
				<a class="person" href="https://github.com/verygreatfrog">
					<h3>VeryGreatFrog</h3>
					<img src="/VeryGreatFrog.png" />
				</a>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import Breadcrumbs from '@/components/Breadcrumbs.vue';
export default {
	components: {
		Breadcrumbs
	}
}
</script>
<style scoped lang="less">
.content {
	& div {
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		width: 100%;
		margin-bottom: 2rem;
		& h2 {
			text-align: center;
			margin-bottom: 1.5rem;
			font-size: 2.5rem;
			border-bottom: 2px solid orangered;
			padding: 0 1rem;
		}
	}
}
.logo {
	width: 75%;
	max-height: 30rem;
	aspect-ratio: 1;
}

//Made by
.developers {
	& div {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: start;
		width: 100%;
		max-width: 75rem;
		& .person {
			width: 40%;
			display: flex;
			flex-direction: column;
			justify-content: start;
			align-items: center;
			text-decoration: none;
			& h3 {
				font-size: 1.5rem;
				color: var(--color-base--emphasized);
			}
			& img {
				width: 90%;
				max-height: 25rem;
				object-fit: contain;
			}
		}
	}
}
</style>
