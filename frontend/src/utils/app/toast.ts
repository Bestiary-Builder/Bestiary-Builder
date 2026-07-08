import { toast } from "vue-sonner";
import { h } from "vue";

export const $toast = toast;

export const htmlToast = (html: string) => {
	return h("div", {
		innerHTML: `${html}`
	});
};
