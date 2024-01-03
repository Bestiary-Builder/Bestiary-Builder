<template>
<Teleport to="#modal">
  <Transition name="modal">
    <div v-if="show" class="modal__bg" @click="$emit('close')">
      <div class="modal__content" @click.stop>
        <div class="modal__header">
          <slot name="header">default header</slot>
          <button
              class="modal__close-button"
              @click="$emit('close')"
            ><font-awesome-icon icon="fa-solid fa-xmark" /></button>
        </div>

        <div class="modal__body">
          <slot name="body">default body</slot>
        </div>

        <div class="modal__footer modal__buttons">
          <slot name="footer">
            <!-- <button
              class="btn"
              @click="$emit('close')"
            >Close</button> -->
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    show: {
        type: Boolean,
        required: true
    }
  },
  emits: ['close']
})
</script>

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

	z-index: 100;
}

.modal__content {
	position: relative;
	width: fit-content;
  max-width: 80%;
	padding: 2rem;
  max-height: 80%;
	background-color: var(--color-surface-1);
	border-radius: 1rem;
	overflow-y: scroll;
	overscroll-behavior: contain;
	box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}

.modal__small {
	width: 50%;
	height: fit-content;
	max-height: 90%;
}

.modal__close-button {
	position: absolute;
	top: .3rem;
	right: 0.1rem;

	font-size: 2rem;
	color: var(--color-surface-0);
	background: none;
	border: none;
	cursor: pointer;
  transition: color .3s ease;
  &:hover {
    color: orangered;
  }
}

.modal__header {
	border-bottom: 1px solid orangered;
  font-size: 1.5rem;
  margin-bottom: .5rem;
}

.modal__buttons {
	display: flex;
	gap: 1rem;
	justify-content: center;
	margin-top: 2rem;

	& button {
    font-size: 1.5rem;
    padding: 1rem;
    height: unset;
		cursor: pointer;
	}
}

@media screen and (max-width: 842px) {
	// disable overscrolling when there is a modal;
	body:has(#modal .modal__bg) {
		overflow: hidden;
	}
	.modal__bg {
		top: 0%;
		z-index: 100;
	}
	.modal__content,
	.modal__small {
		width: 95%;
		height: fit-content;
		max-height: 98%;
		border-radius: 0;
		padding: 2rem .8rem;
	}

	.modal__close-button {
		font-size: 2rem;
		top: -2%;
		right: 0;
		color: var(--rarity-color-exotic);
	}
}
// .modal-enter-active,
// .modal-leave-active {
// 	transition: all 0.3s ease-out;
// }

// .modal-enter-from,
// .modal-leave-to {
// 	opacity: 0;
// 	/* scale: 1.1 !important; */
// 	scale: 0;
// }

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