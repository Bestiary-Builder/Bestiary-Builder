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
import 'vue-select/dist/vue-select.css';

app.use(ToastPlugin, {
	position: "top-right",
	duration: 5000,
	dismissible: true
}).use(FloatingVue).component('v-select', vSelect);

export const toast = app.config.globalProperties.$toast;

//Types
export type user = {
	id: string;
	username: string;
	avatar: string;
	email: string;
	verified: true;
	banner_color: boolean;
	global_name: string;
};

//Mount
app.mount("body");
