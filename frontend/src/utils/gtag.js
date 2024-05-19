// Google tag
const script = document.createElement("script");
script.src = "https://www.googletagmanager.com/gtag/js?id=G-D5T2260QF1";
script.async = true;
document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag(...args) {
	dataLayer.push(args);
}
gtag("js", new Date());
gtag("config", "G-D5T2260QF1");
