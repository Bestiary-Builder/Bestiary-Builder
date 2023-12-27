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
	imageFormats: string[];
};
export const asyncLimits = fetch("/api/limits").then(async (response: any) => {
	let result = await handleApiResponse<limitsType>(response);
	if (result.success) return result.data as limitsType;
	else return null;
});
export const tags = fetch("/api/tags").then(async (response: any) =>
	handleApiResponse<string[]>(response).then(async (result) => {
		if (result.success) return result.data as string[];
		else return null;
	})
);
const loginBase = "https://discord.com/api/oauth2/authorize?client_id=1183362236509601813&response_type=code&scope=identify+email";
export const loginLink = loginBase + "&redirect_uri=" + encodeURIComponent(window.location.origin + "/user");

//Style sheet
import "./assets/main.less";
//Vue
import {createApp} from "vue";
//@ts-ignore
import VueApp from "./App.vue";
export const app = createApp(VueApp);

//Floating vue
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";
app.use(FloatingVue);
//Router
import router from "./router";
app.use(router);
//Toast notifications
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-default.css";
app.use(ToastPlugin, {
	position: "top-right",
	duration: 4000,
	dismissible: true
});
export const toast = app.config.globalProperties.$toast;
//Font-Awesome-Icons
import {library} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {faStopwatch, faMap, faLocationPin, faClock, faRuler, faStar, faHashtag, faArrowDown19, faHourglass} from "@fortawesome/free-solid-svg-icons";
import {faTwitter, faFacebook, faDiscord, faInstagram} from "@fortawesome/free-brands-svg-icons";
library.add(faTwitter, faFacebook, faDiscord, faInstagram, faStopwatch, faMap, faLocationPin, faClock, faRuler, faStar, faHashtag, faArrowDown19, faHourglass);
app.component("font-awesome-icon", FontAwesomeIcon);
// @ts-ignore Vue Select
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
app.component("v-select", vSelect);

//Mount
app.mount("body");
