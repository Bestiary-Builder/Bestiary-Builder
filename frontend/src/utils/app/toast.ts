import { ref, type Ref } from "vue";

export interface ToastItem {
	id: number
	text: string
	color: ToastColor
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

type ToastColor = 'success' | 'warn' | 'error' | 'info' | ''

const COLOR_ICONS: Record<ToastColor, string> = {
	success: 'mdi:check-circle',
	warn: 'mdi:alert',
	error: 'mdi:close-circle',
	info: 'mdi:information',
	'': 'mdi:information'
}

function getIconForColor(color: string | undefined): string {
	return COLOR_ICONS[(color ?? '') as ToastColor] ?? COLOR_ICONS['']
}

export const useToast = () => {
	const addToast = (text: string, options: AddToastOptions = {}): number => {
		const id = ++counter
		toasts.value.push({
			id,
			text,
			color: options.color ?? '',
			timeout: options.loading ?? false ? -1 : options.timeout ?? 2500,
			show: options.show ?? true,
			loading: options.loading ?? false,
			prependIcon: options.prependIcon ?? getIconForColor(options.color),
			isHtml: options.isHtml ?? false
		})
		return id
	}

	const updateToast = (id: number, patch: UpdateToastPatch): boolean => {
		const toast = toasts.value.find(t => t.id === id)
		if (!toast) return false

		const nextPatch: UpdateToastPatch = { ...patch }

		if (nextPatch.color !== undefined && nextPatch.prependIcon === undefined) {
			nextPatch.prependIcon = getIconForColor(nextPatch.color)
		}

		if (toast.loading && nextPatch.loading === undefined) {
			nextPatch.loading = false
			if (nextPatch.timeout === undefined) {
				nextPatch.timeout = 2500
			}
		}

		Object.assign(toast, nextPatch)
		return true
	}

	const removeToast = (id: number) => {
		const toast = toasts.value.find(t => t.id === id)
		if (!toast) return
		toasts.value.splice(toasts.value.indexOf(toast))
	}

	const clearToasts = () => {
		toasts.value = []
	}

	return { toasts, addToast, updateToast, removeToast, clearToasts }
}