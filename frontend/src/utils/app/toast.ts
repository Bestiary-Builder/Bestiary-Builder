import { ref, type Ref } from "vue";
import type { SingleSnackbarProps } from "vuetify/lib/components/VSnackbarQueue/VSnackbarQueue.mjs";

export interface ToastItem {
	id: number
	text: string
	color: SingleSnackbarProps["color"]
	timeout: number,
	show: boolean,
	loading: boolean,
	prependIcon: string,
	isHtml: boolean
}

export type AddToastOptions = Partial<Omit<ToastItem, 'id' | 'text'>>
export type UpdateToastPatch = Partial<Omit<ToastItem, 'id'>>

const toasts: Ref<ToastItem[]> = ref([])
let counter = 0

export const useToast = () => {
	const addToast = (text: string, options: AddToastOptions = {}): number => {
		const id = ++counter
		toasts.value.push({
			id,
			text,
			color: options.color ?? '',
			timeout: options.loading || false ? -1 : options.timeout ?? 2500,
			show: options.show || true,
			loading: options.loading || false,
			prependIcon: options.prependIcon || 'mdi:information',
			isHtml: false
		})
		return id
	}

	const updateToast = (id: number, patch: UpdateToastPatch): boolean => {
		const toast = toasts.value.find(t => t.id === id)
		if (!toast) return false
		Object.assign(toast, patch)
		return true
	}

	const removeToast = (id: number) => {
		const index = toasts.value.findIndex(t => t.id === id)
		if (index !== -1) toasts.value.splice(index, 1)
	}

	const clearToasts = () => {
		toasts.value = []
	}

	return { toasts, addToast, updateToast, removeToast, clearToasts }
}