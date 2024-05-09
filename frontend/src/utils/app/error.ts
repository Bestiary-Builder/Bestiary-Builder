import { app } from "@/main";

//Send errors to discord
app.config.errorHandler = (err: any, instance, info) => {
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
