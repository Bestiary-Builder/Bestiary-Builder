// @ts-ignore
import mitt, {Emitter} from "mitt";
export const emitter: Emitter = mitt();

//Style sheet
import "./assets/main.css";
// floating vue
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";
//Vue
import {createApp} from "vue";
//@ts-ignore
import VueApp from "./App.vue";
export const app = createApp(VueApp);
//Router
import router from "./router";
app.use(router);
//Toast notifications
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-default.css";

import "./assets/main.css";

// Vue Select
// @ts-expect-error
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

app.use(ToastPlugin, {
	position: "top-right",
	duration: 5000,
	dismissible: true
})
	.use(FloatingVue)
	.component("v-select", vSelect)
	// .use(hljsVuePlugin)

export const toast = app.config.globalProperties.$toast;

//Mount
app.mount("body");

export interface error {
	error: string;
}
export async function handleApiResponse<Type>(response: Response) {
	let data = await response.json();
	if (response.status == 200) {
		//Succesful
		return {success: true, data: data as Type};
	} else {
		//Failed
		return {success: false, data: data as error};
	}
}
