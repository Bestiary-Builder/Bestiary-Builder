<script setup lang="ts">
import type { GlobalStats } from "~/shared";
import { onMounted, onUnmounted, ref } from "vue";
import dataFile from "@/assets/documents/home.md";
import Markdown from "@/components/Global/Markdown.vue";
import { useFetch } from "@/utils/utils";

const stats = ref<null | GlobalStats>(null);
onMounted(async () => {
	const { success, data } = await useFetch<GlobalStats>("/api/stats");
	if (success) {
		stats.value = data;
	}
	else {
		console.error("Failed to retrieve global stats.");
		stats.value = null;
	}
});

const images = [
	{ id: 'a', url: '/hero/a.webp' },
	{ id: 'b', url: '/hero/b.webp' },
	{ id: 'c', url: '/hero/c.webp' },
	{ id: 'd', url: '/hero/d.webp' },
];

const activeIndex = ref(0);
let timerId: number | null = null;
const rotateMs = 10000;

const advance = () => {
	activeIndex.value = (activeIndex.value + 1) % images.length;
};


const startTimer = () => {
	timerId = setInterval(advance, rotateMs);
};

onMounted(() => startTimer());
onUnmounted(() => { if (timerId) clearInterval(timerId); });


const loadedUrls = ref(new Set());

const preloadImage = (url: string): Promise<void> => {
	return new Promise((resolve) => {
		if (loadedUrls.value.has(url)) return resolve();
		const img = new Image();
		img.onload = () => {
			loadedUrls.value.add(url);
			resolve();
		};
		img.onerror = () => resolve();
		img.src = url;
	});
};

// Load images one at a time, in the background, after the page is idle
const preloadQueue = async () => {
	for (const img of images) {
		await preloadImage(img.url);
	}
};

const getBackgroundStyle = (img: { url: string }) => {
	return loadedUrls.value.has(img.url)
		? { backgroundImage: `url(${img.url})` }
		: {};
};

onMounted(() => {
	// Load the first (active) image right away
	preloadImage(images[0].url).then(() => {
		// Then defer the rest until the browser is idle
		if ('requestIdleCallback' in window) {
			requestIdleCallback(() => preloadQueue());
		} else {
			setTimeout(preloadQueue, 200);
		}
	});
});

</script>

<template>
	<section class="hero">
	<div
		v-for="(img, index) in images"
		:key="img.id"
		class="hero__layer"
		:class="{ 'is-active': index === activeIndex }"
		:style="getBackgroundStyle(img)"
	></div>

		<!-- <div class="hero__scrim"></div> -->

		<div class="hero__content">
			<div class="hero__brand">Bestiary Builder <span>&middot;</span> The Ultimate D&D Bestiary Creator for Avrae
			</div>

			<div class="hero__body">
				<h1 class="hero__headline">
					Build your Bestiary with <em>ease.</em><br>
					Integrate with <em>Avrae.</em><br>

				</h1>
				<p class="hero__subhead">
					Join our <b>{{ stats?.users }}</b> users.<br>
					Flip through our <b>{{ stats?.bestiaries }}</b> bestiaries!<br>
					And frighten your players with our <b>{{ stats?.creatures }}</b> creatures!
				</p>
				<v-btn size="x-large" to="/changelog" color="primary" variant="elevated">
					See what's new in 3.0.0
				</v-btn>
			</div>
		</div>
	</section>

	<v-container max-width="600">
	<v-row class="mt-8" >
		<v-col cols="6" class="d-flex justify-center">
			<v-btn color="#f1465a" size="x-large" prepend-icon="mdi:patreon" class="rounded"
				variant="elevated" href="https://www.patreon.com/join/BestiaryBuilder" width="250">
				Support us on Patreon
			</v-btn>
		</v-col>

		<v-col cols="6" class="d-flex justify-center">
			<v-btn color="#5865f2" size="x-large" prepend-icon="mdi:discord" class="rounded" variant="elevated"
				href="https://discord.gg/a6bwXCSymN" width="250">
				Join our Discord
			</v-btn>
		</v-col>
	</v-row>
	</v-container>

	<div class="content markdown less-wide front-page">
		<Markdown :text="dataFile" :options="{ html: true, linkify: true, typographer: true }" />
	</div>


	<v-row class="my-8">
		<v-col cols="12" class="text-center">
			<h2>Developers</h2>
		</v-col>
		<v-col cols="6">
			<div class="float-right">
				<img src="/VeryGreatFrog.jpg" alt="VeryGreatFrog"
					style="width: 15vw; height: 15vw; margin: auto; object-fit: cover" />
				<div style="text-align: center">VeryGreatFrog</div>
			</div>
		</v-col>
		<v-col cols="6">
			<div class="float-left">
				<img src="/Stevnbak.png" alt="Stevnbak"
					style="width: 15vw; height: 15vw; margin: auto; object-fit: cover" />
				<div style="text-align: center">Stevnbak</div>
			</div>
		</v-col>
	</v-row>
</template>

<style scoped lang="less">
:root {
	--paper: #e8e4d9;
	--accent: rgb(var(--v-theme-primary));
	--accent-deep: #8c6e1b;
	--overlay-top: rgba(10, 9, 7, 0.15);
	--overlay-bottom: rgba(10, 9, 7, 0.78);
}


.hero {
	position: relative;
	height: calc(100vh - 64px);
	width: 100%;
	overflow: hidden;
	color: var(--paper);
}

.hero__layer {
	position: absolute;
	inset: 0;
	background-size: cover;
	background-position: center;
	opacity: 0;
	transition: opacity 1.8s ease;
	animation: zoominout 10s ease-in-out infinite alternate;
	will-change: transform, opacity;
}

.hero__layer.is-active {
	opacity: 1;
	z-index: 1;
}

@keyframes zoominout {
	from {
		transform: scale(1);
	}

	to {
		transform: scale(1.25);
	}
}

.hero__scrim {
	position: absolute;
	inset: 0;
	z-index: 2;
	background: linear-gradient(180deg, var(--overlay-top) 0%, var(--overlay-bottom) 100%);
}

.hero__content {
	position: relative;
	z-index: 3;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 40px clamp(20px, 6vw, 72px);
}

.hero__brand {
	font-family: 'Inter', sans-serif;
	font-weight: 600;
	font-size: 1.1rem;
	letter-spacing: 0.02em;
	color: var(--paper);
	text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
}

.hero__brand span {
	color: var(--accent);
}

.hero__body {
	max-width: 800px;
	margin-bottom: 48px;

}

.hero__headline {
	font-family: 'Newsreader', serif;
	font-weight: 500;
	font-size: clamp(1.6rem, 3.4vw, 2.6rem);
	line-height: 1.12;
	margin: 0 0 20px;
	text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);

}

.hero__headline em {
	font-style: normal;
	color: rgb(var(--v-theme-primary));

}

.hero__subhead {
	font-family: 'Inter', sans-serif;
	font-weight: 400;
	font-size: clamp(0.95rem, 1.6vw, 1.08rem);
	line-height: 1.55;
	color: rgba(232, 228, 217, 0.86);
	max-width: 480px;
	margin: 0 0 32px;

	text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);

}

.hero__cta.v-btn {
	text-transform: none;
	font-family: 'Inter', sans-serif;
	font-weight: 500;
	letter-spacing: 0.01em;
	border-radius: 2px;

	padding: 0 26px;
	height: 46px;
}


@media (prefers-reduced-motion: reduce) {
	.hero__layer {
		animation: none;
	}
}
</style>
