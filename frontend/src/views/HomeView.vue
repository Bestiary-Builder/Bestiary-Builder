<template>
	<div class="content">
		<h1><span>Bestiary Builder</span></h1>
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

<style scoped lang="less">
.content {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;

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
		justify-content: space-evenly;
		align-items: start;
		width: 100%;
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
				aspect-ratio: 1;
				width: 90%;
			}
		}
	}
}
</style>
