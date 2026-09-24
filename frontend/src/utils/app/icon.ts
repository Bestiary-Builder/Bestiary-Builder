import { Icon } from "@iconify/vue";
import { h } from "vue";

const iconifyAdapter = {
	component: (props: any) =>
		h(Icon, {
			icon: props.icon,
			style: {
				width: "1em",
				height: "1em",
				margin: "auto 0",
			},
		}),
};

export default iconifyAdapter;
