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
import type {User} from "@/../../shared";
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
const clientId = import.meta.env.VITE_DISCORD_ID ?? "";
const loginLink = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&response_type=code&scope=identify+email&redirect_uri=${encodeURIComponent(window.location.origin + "/user")}`;

export function sendToLogin(route: string) {
	window.document.cookie = "route=" + route;
	window.location.href = loginLink;
}
export function getLoginRoute() {
	let name = "route=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(";");
	//Reset cookie
	document.cookie = "route=;";
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

//Style sheet
import "@/assets/main.less";
//Vue
import {createApp} from "vue";
//@ts-ignore
import VueApp from "@/App.vue";
export const app = createApp(VueApp);

//Floating vue
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";
app.use(FloatingVue);
//Router
import router from "@/router";
app.use(router);
//Toast notifications
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-default.css";
app.use(ToastPlugin, {
	position: "top-left",
	duration: 4000,
	dismissible: true
});
export const toast = app.config.globalProperties.$toast;

// Loading animation
import {LoadingPlugin} from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
app.use(LoadingPlugin, {
	loader: "dots",
	color: "orangered",
	backgroundColor: "black",
	height: 128,
	width: 128
});

//Font-Awesome-Icons
import {library} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {
	faTrash,
	faLock,
	faSkull,
	faBars,
	faPenToSquare,
	faStopwatch,
	faMap,
	faLocationPin,
	faClock,
	faRuler,
	faStar,
	faHashtag,
	faArrowDown19,
	faHourglass,
	faUserLock,
	faScaleBalanced,
	faShareNodes,
	faArrowRightFromBracket,
	faArrowRightToBracket,
	faLink,
	faEarthEurope,
	faXmark,
	faPlus,
	faThumbTack,
	faFilter,
	faMagnifyingGlass,
	faTag,
	faArrowUpWideShort,
	faGripVertical,
	faEyeSlash,
	faEye
} from "@fortawesome/free-solid-svg-icons";
import {faTwitter, faFacebook, faDiscord, faInstagram, faPatreon, faGithub} from "@fortawesome/free-brands-svg-icons";
library.add(
	faTrash,
	faXmark,
	faStar,
	faLock,
	faLink,
	faSkull,
	faEarthEurope,
	faTwitter,
	faPenToSquare,
	faFacebook,
	faDiscord,
	faInstagram,
	faStopwatch,
	faMap,
	faLocationPin,
	faClock,
	faRuler,
	faStar,
	faHashtag,
	faArrowDown19,
	faHourglass,
	faUserLock,
	faScaleBalanced,
	faShareNodes,
	faArrowRightFromBracket,
	faArrowRightToBracket,
	faPatreon,
	faGithub,
	faBars,
	faPlus,
	faThumbTack,
	faFilter,
	faMagnifyingGlass,
	faTag,
	faArrowUpWideShort,
	faGripVertical,
	faEyeSlash,
	faEye
);

app.component("font-awesome-icon", FontAwesomeIcon);
// @ts-ignore Vue Select
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
app.component("v-select", vSelect);

//Mount
app.mount("body");

// global isMobile for use with VDropdown
export const isMobile = screen.width < 900;

//Gtag
if (import.meta.env.MODE == "production") {
	import("./utils/gtag" as any);
}
