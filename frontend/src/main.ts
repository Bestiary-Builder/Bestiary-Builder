//Api handling
export interface error {
	error: string;
}
export async function handleApiResponse<Type>(response: Response) {
	let data = await response.json();
	if (response.status >= 200 && response.status < 300) {
		//Succesful
		return {success: true, data: data as Type};
	} else {
		//Failed
		return {success: false, data: data as error};
	}
}
//Get logged in user
import type {User} from "./components/types";
export const user = fetch("/api/user").then(async (response: any) => {
	let result = await handleApiResponse<User>(response);
	if (result.success) return result.data as User;
	else return null;
});

export type limitsType = {
	nameLength: number;
	nameMin: number;
	descriptionLength: number;
	creatureAmount: number;
};
export const limits = fetch("/api/limits").then(async (response: any) => {
	let result = await handleApiResponse<limitsType>(response);
	if (result.success) return result.data as limitsType;
	else return null;
});
console.log(window.location.host);
const loginBase = "https://discord.com/api/oauth2/authorize?client_id=1183362236509601813&response_type=code&scope=identify+email";
export const loginLink = loginBase + "&redirect_uri=" + encodeURIComponent(window.location.origin + "/user");
console.log(loginLink);

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
	.component("v-select", vSelect);

export const toast = app.config.globalProperties.$toast;

//Mount
app.mount("body");
