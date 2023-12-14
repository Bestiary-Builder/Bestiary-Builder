<template>
	<!-- <div class="content" :key="key">
		<div class="bestiary" v-if="bestiary">
			<h2>{{ bestiary.name }}</h2>
			<p>Description: {{ bestiary.description }}</p>
			<p>Status: {{ bestiary.status }}</p>
			<p>Creature amount: {{ bestiary.creatures.length }}</p>
			<div class="owner">
				<p>Owner:</p>
				<UserBanner :id="bestiary.owner" />
			</div>
			<div class="creatures">
				<a class="creature" v-for="creature in creatures">
					<p>Creature:</p>
					<p>{{ creature.stats?.description?.name }}</p>
				</a>
			</div>
			<a :href="'/bestiary-editor/' + bestiary._id" v-if="user && user._id == bestiary.owner"><button>Edit</button></a>
		</div>
	</div> -->
	
	<div class="content">
		<h1><span>bestiary viewer </span></h1>
		<div class="bestiary" v-if="bestiary">
			<div class="tile-container list-tiles">
				<div class="content-tile header-tile"> 
					<h2>{{ bestiary.name }}</h2>
					<p>Description: {{ bestiary.description }}</p>
					<p>Status: {{ bestiary.status }}</p>
					<p>Creature amount: {{ bestiary.creatures.length }}</p>
					<div class="owner">
						<p>Owner:</p>
						<UserBanner :id="bestiary.owner" />
					</div>

					<a :href="'/bestiary-editor/' + bestiary._id" v-if="user && user._id == bestiary.owner"><button>Edit</button></a>

				</div>

				<div class="content-tile creature-tile"  v-for="creature in creatures" @mouseover="selectedCreature=creature.stats" @click="selectedCreature=creature.stats">
					<div class="left-side">
						<h2> {{ creature.stats?.description?.name }}</h2>
						<span>{{ creature.stats?.core?.size }} {{ creature.stats?.core?.race }}{{ creature.stats?.description?.alignment ? ', ' +  creature.stats?.description?.alignment : ""}}</span>
					</div>
					<div class="right-side" v-if="creature.stats?.description?.cr">
						<span> CR {{ creature.stats.description.cr }}</span>
					</div> 
				</div>
			</div>

			<div class="statblock-container" v-if="creatures && selectedCreature">
				<StatblockRenderer :data="selectedCreature"/> 
			</div>
		
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature, Statblock} from "@/components/types";
import UserBanner from "@/components/UserBanner.vue";
import {handleApiResponse, user, type error, toast} from "@/main";
import StatblockRenderer from "@/components/StatblockRenderer.vue";

export default defineComponent({
	// data: () => ({key: 0} as {bestiary: Bestiary | null; creatures: Creature[] | null; user: User | null; key: number, selectedCreature: null | Statblock}),
	data() {
		return {
			bestiary: null as Bestiary | null,
			creatures: null as Creature[] | null,
			user: null as User | null,
			selectedCreature: null as null | Statblock

		}
	},
	components: {
    	UserBanner,
    	StatblockRenderer,
	},
	async beforeMount() {
		this.getBestiary();
		this.user = await user;
	},
	methods: {
		async getBestiary() {
			//Get id
			let id = this.$route.params.id;
			//Request bestiary info
			await fetch("/api/bestiary/" + id).then(async (response) => {
				let result = await handleApiResponse<Bestiary>(response);
				if (result.success) {
					this.bestiary = result.data as Bestiary;
					//Fetch creatures
					await fetch("/api/bestiary/" + this.bestiary._id + "/creatures").then(async (creatureResponse) => {
						let creatureResult = await handleApiResponse<Creature[]>(creatureResponse);
						if (creatureResult.success) {
							this.creatures = creatureResult.data as Creature[];
						} else {
							this.creatures = null;
							toast.error((creatureResult.data as error).error);
						}
					});
				} else {
					this.bestiary = null;
					toast.error((result.data as error).error);
				}
			});

		},
		setSelectedCreature(creature : any) {
			this.selectedCreature = creature
			console.log(this.selectedCreature)
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
			padding: 0 10rem
		}
	}
}

@media screen and (max-width: 1800px) {
	.content h1 span {
		padding: 0 7rem
	}
}

@media screen and (max-width: 1550px) {
	.content h1 span {
		padding: 0 4rem
	}
}

@media screen and (max-width: 1050px) {
	.content h1  {
		font-size: 2rem;

		span { 
			padding: 0 2rem
		}
	}
}

.list-tiles {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	.content-tile {
		height: fit-content !important;
		background: rgb(59, 55, 54);
		color: white;
		padding: 1rem;
		box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;

		transition: all 1s;
		transition-timing-function: cubic-bezier(0.060, 0.975, 0.195, 0.985);

		h2 {
			font-size: 1.5rem;
		}
		&.creature-tile {
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			justify-content: space-between;

			.left-side span {
				font-style: italic;
				font-size: .85rem;
			}

			.right-side span {
				color: orangered;
				font-size: 1.2rem;
				display: flex;
				align-items: center;
				height: 100%;
			}
		}
	}

	.header-tile {
		background-color: orangered;

		
		cursor: pointer;

		& h2 {
			text-transform: lowercase;
			text-align: center;
			border-bottom: 1px dotted white;
		}

	}

}

.bestiary {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr;
}

.content-tile:hover {
	scale: 1.05;

}

.bestiary-tile:hover {
	background-color: rgb(56, 53, 52);
}

</style>
