//Style sheet
import "@/assets/styles/main.less";
//Vue
import {createApp} from "vue";
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
import {LoadingPlugin, type Props} from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
export const loadingOptions: Props = {
	loader: "dots",
	color: "orangered",
	backgroundColor: "black",
	height: 128,
	width: 128
};
app.use(LoadingPlugin, loadingOptions);

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
	faEye,
	faCircleInfo
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
	faEye,
	faCircleInfo
);

app.component("font-awesome-icon", FontAwesomeIcon);
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
app.component("v-select", vSelect);

// monaco editor
import {loader} from "@guolao/vue-monaco-editor";
loader.config({
	paths: {
		vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs"
	}
});

//Mount
app.mount("body");

// global isMobile for use with VDropdown
export const isMobile = screen.width < 900;

//Gtag
if (import.meta.env.MODE == "production") {
	import("./utils/gtag.js" as any);
}
