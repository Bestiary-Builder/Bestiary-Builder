import { h } from "vue";
import { toast } from "vue-sonner";

export const $toast = toast;

export const htmlToast = (html: string) => {
	return h("div", {
		innerHTML: `${html}`
	});
};
