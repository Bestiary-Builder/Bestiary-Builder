<template>
	<div class="content" :key="key">
		<h1><span>my bestiaries </span></h1>

		<div class="tile-container">
			<div class="content-tile create-tile" @click.prevent="createBestiary">
				<button class="create-button">+</button>
			</div>

			<a class="content-tile bestiary-tile" v-for="bestiary in bestiaries" :href="'/bestiary-viewer/' + bestiary._id" v-if="bestiaries">
				<h2>{{ bestiary.name }}</h2>
				<div class="bestiary-tile-content">
					<p class="description">{{ bestiary.description }}</p>
					<div class="footer">
						<span>{{ statusEmoji(bestiary.status) }}{{ bestiary.status }}</span>
						<a :href="'/bestiary-editor/' + bestiary._id" v-if="user"><button>Edit</button></a>
						<span>{{ bestiary.creatures.length }}🐉</span>
					</div>
				</div>
			</a>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import {handleApiResponse, toast, user} from "@/main";
import type {error} from "@/main";

export default defineComponent({
	data: () => ({bestiaries: [] as Bestiary[], key: 0} as {bestiaries: Bestiary[]; user: User | null; key: number}),
	async beforeMount() {
		this.user = await user;
		this.getBestiaries();
	},
	methods: {
		async createBestiary() {
			console.log("Create");
			//Replace for actual creation data:
			let data = {
				name: "Example name",
				description: "Example description of bestiary",
				status: "public",
				creatures: [] as string[]
			} as Bestiary;
			//Send data to server
			await fetch("/api/update/bestiary", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({data: data})
			}).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Created bestiary");
					// @ts-ignore
					window.location.href = "/bestiary-viewer/" + result.data._id;
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiaries();
			this.key++;
		},
		async getBestiaries() {
			//Get user
			let userId = this.user?._id;
			if (userId) {
				//Request bestiary info
				await fetch(`/api/user/${userId}/bestiaries`).then(async (response) => {
					let result = await handleApiResponse<Bestiary[]>(response);
					if (result.success) this.bestiaries = result.data as Bestiary[];
					else {
						this.bestiaries = [];
						toast.error((result.data as error).error);
					}
				});
				console.log(this.bestiaries);
			}
			this.key++;
		},
		statusEmoji(status: "public" | "private" | "unlisted"): string {
			return status == "public" ? "🌍" : status == "private" ? "🔒" : "🔗";
		}
	}
});
</script>

<style scoped lang="less">
.content {
	margin: 1rem 5vw;

	& h1 {
		text-align: center;
		margin-bottom: 2rem;
		font-size: 3rem;

		& span {
			border-bottom: 4px solid orangered;
			padding: 0 10rem;
		}
	}
}

.tile-container {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	gap: 1.5em;
}

@media screen and (max-width: 1800px) {
	.tile-container {
		grid-template-columns: 1fr 1fr 1fr;
	}
	.content h1 span {
		padding: 0 7rem;
	}

	.bestiary-tile-content {
		height: 20rem;

		.description {
			max-height: 17rem;
		}
	}
}

@media screen and (max-width: 1550px) {
	.tile-container {
		grid-template-columns: 1fr 1fr;
	}

	.bestiary-tile-content {
		height: 17rem;

		.description {
			max-height: 14rem;
		}
	}

	.content h1 span {
		padding: 0 4rem;
	}
}

@media screen and (max-width: 1050px) {
	.tile-container {
		grid-template-columns: 1fr;
	}

	.bestiary-tile-content {
		height: 14rem;

		.description {
			max-height: 11rem;
		}
	}

	.content h1 {
		font-size: 2rem;

		span {
			padding: 0 2rem;
		}
	}
}

.content-tile {
	aspect-ratio: 1 / 1 !important;
	background: rgb(59, 55, 54);
	color: white;
	padding: 1rem;
	box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;

	transition: all 1s;
	transition-timing-function: cubic-bezier(0.06, 0.975, 0.195, 0.985);

	&.create-tile {
		background-color: orangered;
		display: flex;
		justify-content: center;
		align-items: center;
		user-select: none;
		cursor: pointer;

		& .create-button {
			background-color: transparent;
			color: white;
			border: none;
			outline: none;
			font-size: 25rem;
			line-height: 0;
			pointer-events: none;
		}
	}
	&.bestiary-tile {
		text-decoration: none;

		& h2 {
			text-transform: lowercase;
			text-align: center;
			border-bottom: 1px solid orangered;
		}

		& .bestiary-tile-content {
			display: flex;
			justify-content: space-between;
			flex-direction: column;
			position: relative;
			height: 23rem;

			.description {
				text-overflow: ellipsis;
				max-height: 20rem;
				overflow: hidden;
			}

			.footer {
				display: grid;
				grid-template-columns: 1fr 1fr 1fr;
				font-size: 1.2rem;

				span:first-of-type {
					text-align: left;
				}
				span:last-of-type {
					text-align: right;
				}
				.fake-edit-button {
					text-align: center;
					text-decoration: underline;
				}
			}
		}
	}
}

.content-tile:hover {
	scale: 1.05;
}

.bestiary-tile:hover {
	background-color: rgb(56, 53, 52);
}
</style>
