// Simple global functions used in several places in the UI
export function statusEmoji(status: "public" | "private" | "unlisted"): string {
    return status == "public" ? "🌍" : status == "private" ? "🔒" : "🔗";
}

export function displayCR(cr: number) : string {
    if (cr == 0.125) return "1/8"
    if (cr == 0.25) return "1/4"
    if (cr == 0.5) return "1/2"
    return cr.toString()
}