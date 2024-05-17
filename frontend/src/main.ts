// Style sheet
import "@/assets/styles/main.less";

// Vue
import { type Component, createApp, } from "vue";

// Router

// Floating vue
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";

// Toast notifications
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-default.css";

// Font awesome
import "@/utils/app/fontawesome";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Vue-select
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

// monaco editor
import { loader } from "@guolao/vue-monaco-editor";
import router from "@/router";
import App from "@/App.vue";

export const app = createApp(App as Component<any>);
app.use(router);
app.use(FloatingVue);
app.use(ToastPlugin, {
	position: "top-left",
	duration: 4000,
	dismissible: true
});
app.component("font-awesome-icon", FontAwesomeIcon);
app.component("v-select", vSelect);
loader.config({
	paths: {
		vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs"
	}
});

// Google analytics
if (import.meta.env.MODE === "production")
	import("./utils/gtag.js" as any);

// error handling
if (import.meta.env.MODE === "production")
	import("./utils/app/error");

// Finally, mount our app.
app.mount("body");
