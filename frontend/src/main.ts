//Style sheet
import "@/assets/styles/main.less";

//Vue
import {createApp} from "vue";
import App from "@/App.vue";
export const app = createApp(App);

//Router
import router from "@/router";
app.use(router);

//Floating vue
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";
app.use(FloatingVue);

//Toast notifications
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-default.css";
app.use(ToastPlugin, {
	position: "top-left",
	duration: 4000,
	dismissible: true
});

//Font awesome
import "@/utils/app/fontawesome";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
app.component("font-awesome-icon", FontAwesomeIcon);

//Vue-select
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

//Google analytics
if (import.meta.env.MODE == "production") {
	import("./utils/gtag.js" as any);
}

//Finally, mount our app.
app.mount("body");

//Send errors to discord
app.config.errorHandler = (err: any, instance, info) => {
	console.error(err);
	if (import.meta.env.PROD)
		fetch(import.meta.env.VITE_ERROR_WEBHOOK, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				content: `Frontend error: \n${err.stack ?? err}`,
				username: "Bestiary Builder",
				avatar_url: "https://bestiarybuilder.com/logo.png"
			})
		}).catch(() => {
			console.error("Failed to send error message.");
		});
};
