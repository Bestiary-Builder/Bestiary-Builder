import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { app, isProduction } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { getUserFromSecret, updateUser } from "@/utilities/database";

app.head("/api/login", async (req, res) => {
	return res.sendStatus(200);
});
app.get("/api/login", async (req, res) => {
	try {
		const code = (req.query.code ?? "") as string;
		if (!code)
			return res.redirect(`/user?loginError=${encodeURIComponent("No login code recieved.")}`);
		let redirectUrl = `${isProduction ? "https" : "http"}://${req.get("host")}/api/login`;
		if (!isProduction)
			redirectUrl = redirectUrl.replace("5000", "5173");
		const oauthData = (await fetch("https://discord.com/api/oauth2/token", {
			method: "POST",
			body: new URLSearchParams({
				client_id: process.env.clientId ?? "",
				client_secret: process.env.clientSecret ?? "",
				code,
				grant_type: "authorization_code",
				redirect_uri: redirectUrl,
				scope: "identify+email"
			}).toString(),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Accept": "application/json"
			}
		}).then(res => res.json())) as {
			token_type: string;
			access_token: string;
			error?: string;
			error_description?: string;
		};
		if (oauthData.error) {
			log.error(`Discord login failed: ${oauthData.error_description} | Code: ${code}`);
			return res.redirect(`/user?loginError=${encodeURIComponent("Failed to authenticate discord login.")}`);
		}
		const userResult = (await fetch("https://discord.com/api/users/@me", {
			headers: {
				authorization: `${oauthData?.token_type} ${oauthData?.access_token}`
			}
		}).then(res => res.json())) as {
			id: string;
			username: string;
			avatar: string;
			email: string;
			verified: boolean;
			banner_color: string;
			global_name: string;
		};
		if (userResult) {
			// Update user
			const secret = await updateUser({
				_id: userResult.id,
				username: userResult.username,
				avatar: userResult.avatar,
				email: userResult.email,
				verified: userResult.verified,
				banner_color: userResult.banner_color,
				global_name: userResult.global_name
			});
			// Create JWT token
			const token = jwt.sign({ id: secret }, process.env.JWTKEY ?? "key", {
				expiresIn: "7d"
			});
			res.cookie("userToken", token, { expires: new Date(new Date().getTime() + 60 * 60 * 1000 * 24 * 7), sameSite: "strict", secure: true, httpOnly: true });
			log.info(`User with the id ${userResult.id} logged in`);
			// Get route cooklie
			const route = req.cookies.route ?? "/";
			return res.redirect(`${route}?loginSuccess=true`);
		}
		else {
			return res.redirect(`/user?loginError=${encodeURIComponent("No user recieved from discord.")}`);
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.redirect(`/user?loginError=${encodeURIComponent("Unknown server error occured, please try again")}`);
	}
});
app.get("/api/logout", async (req, res) => {
	res.clearCookie("userToken");
	return res.json({});
});
export const requireUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.cookies.userToken;
		if (!token)
			return res.status(401).json({ error: "Not logged in." });
		try {
			const decoded = jwt.verify(token, process.env.JWTKEY ?? "key") as { id: string };
			const user = await getUserFromSecret(decoded.id);
			if (!user)
				return res.status(401).send({ error: "User token doesn't correspond to any user." });
			req.body.user = user;
		}
		catch {
			return res.status(401).send({ error: "Invalid user token." });
		}
		return next();
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
};
export const possibleUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.cookies.userToken;
		req.body.user = null;
		if (token) {
			try {
				const decoded = jwt.verify(token, process.env.JWTKEY ?? "key") as { id: string };
				const user = await getUserFromSecret(decoded.id);
				req.body.user = user;
			}
			catch {}
		}
		return next();
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
};
