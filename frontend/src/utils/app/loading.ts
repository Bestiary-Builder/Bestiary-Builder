import {useLoading} from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";

export const $loading = useLoading({
	loader: "dots",
	color: "orangered",
	backgroundColor: "black",
	height: 128,
	width: 128
})