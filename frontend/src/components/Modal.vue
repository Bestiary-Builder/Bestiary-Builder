<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useId, watch } from "vue";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";

const { show, fullScreen = false } = defineProps<{ show: boolean; fullScreen?: boolean }>();

const emit = defineEmits<{
	(e: "close",): void;
}>();

const id = useId();

const target = ref(null);
const { activate, deactivate } = useFocusTrap(target);

watch(
	() => show,
	async (newValue, oldValue) => {
		if (newValue === oldValue)
			return;
		if (newValue === true) {
			await nextTick();
			activate();
		}
		if (newValue === false) {
			await nextTick();
			deactivate();
		}
	}
);

const escapeHandler = (e: KeyboardEvent) => {
	if (e.key === "Escape" && show)
		emit("close");
};
onMounted(() => {
	document.addEventListener("keydown", escapeHandler);
});
onUnmounted(() => {
	document.removeEventListener("keydown", escapeHandler);
});
</script>

<template>
	<Teleport to="#modal">
		<Transition name="modal">
			<div v-show="show" ref="target" class="modal__bg" :class="{ 'open-modal': show }" @click="$emit('close')">
				<div :class="{ fullscreen: fullScreen }" class="modal__content" role="dialog" aria-modal="true" :aria-labelledby="`dialog${id}_label`" @click.stop>
					<div class="modal__header">
						<h2 :id="`dialog${id}_label`">
							<slot name="header" />
						</h2>
						<button class="modal__close-button" @click="emit('close')">
							<font-awesome-icon icon="fa-solid fa-xmark" title="Close Modal" />
						</button>
					</div>
					<div class="modal__body">
						<slot name="body" />
					</div>
					<div class="modal__footer modal__buttons">
						<slot name="footer" />
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style lang="less">
.modal__bg {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;

	background-color: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(2.5px);

	display: flex;
	justify-content: center;
	align-items: center;

	z-index: 1000;
}

.modal__content {
	position: relative;
	//width: 80%;
	max-width: 80%;
	padding: 2rem;
	max-height: 80%;
	background-color: var(--color-surface-1);
	border-radius: 1rem;
	overflow-y: scroll;
	overscroll-behavior: contain;
	box-shadow:
		rgba(0, 0, 0, 0.4) 0px 2px 4px,
		rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
		rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}

.modal__content.fullscreen {
	width: 100%;
	max-width: 100%;
	padding: 2rem 4rem;
	max-height: 100%;
	height: 100%;
	border-radius: 0;
	box-shadow: none;

	.modal__close-button {
		color: var(--color-destructive);
		font-size: 4rem;
	}
}

.modal__close-button {
	position: absolute;
	top: 0.3rem;
	right: 0.1rem;

	font-size: 2rem;
	color: var(--color-surface-0);
	background: none;
	border: none;
	cursor: pointer;
	transition: color 0.3s ease;
	&:hover {
		color: orangered;
	}
}

.modal__header {
	border-bottom: 1px solid orangered;
	font-size: 1.3rem;
	margin-bottom: 0.5rem;
}

.modal__buttons {
	display: flex;
	gap: 1rem;
	justify-content: center;
	margin-top: 2rem;

	button {
		font-size: 1.3rem;
		padding: 1rem;
		height: unset;
		cursor: pointer;
	}
}

@media screen and (max-width: 842px) {
	.modal__bg {
		top: 0%;
	}

	.modal__content {
		max-width: 100%;
		width: 100%;
		height: 100%;
		max-height: 100%;
		border-radius: 0;
		box-shadow: none;
		padding: 2rem 0.8rem;
	}

	.modal__content.fullscreen {
		padding: 0.2rem 0.8rem;
	}
}

.modal-enter-active {
	animation: slideIn 0.4s;
}
.modal-leave-active {
	animation: slideIn 0.4s reverse;
}

@keyframes slideIn {
	0% {
		transform: translateY(-100%);
		opacity: 0;
	}
	100% {
		transform: translateY(0px);
		opacity: 1;
	}
}
</style>
