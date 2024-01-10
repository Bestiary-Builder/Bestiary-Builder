import {app, isProduction, JWTKey} from "../server";
import {log} from "../logger";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import {getUser, getUserFromSecret, updateUser, User} from "../database";
import {NextFunction, Response, Request} from "express";

app.get("/api/login/:code", async (req, res) => {
	try {
		let code = req.params.code;
		let redirectUrl = req.protocol + "://" + req.get("host") + "/user";
		if (!isProduction) redirectUrl = redirectUrl.replace("5000", "5173");

		const tokenResponseData = await fetch("https://discord.com/api/oauth2/token", {
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
				"Content-Type": "application/x-www-form-urlencoded"
			}
		});
		const oauthData = (await tokenResponseData.json()) as {
			token_type: string;
			access_token: string;
			error?: string;
			error_description?: string;
		};
		if (!oauthData.error) {
			const userResult = (await (
				await fetch("https://discord.com/api/users/@me", {
					headers: {
						authorization: `${oauthData?.token_type} ${oauthData?.access_token}`
					}
				})
			).json()) as {
				id: string;
				username: string;
				avatar: string;
				email: string;
				verified: boolean;
				banner_color: string;
				global_name: string;
			};
			if (userResult) {
				//Update user
				let secret = await updateUser({
					_id: userResult.id,
					username: userResult.username,
					avatar: userResult.avatar,
					email: userResult.email,
					verified: userResult.verified,
					banner_color: userResult.banner_color,
					global_name: userResult.global_name
				});
				//Create token
				const token = jwt.sign({id: secret}, JWTKey, {
					expiresIn: "7d"
				});
				res.cookie("userToken", token, {expires: new Date(new Date().getTime() + 60 * 60 * 1000 * 24 * 7), sameSite: "strict", secure: true, httpOnly: true});
				log.info(`User with the id ${userResult.id} logged in`);
				return res.json({});
			} else {
				return res.status(400).json({error: "No user recieved from discord."});
			}
		} else {
			log.error("Discord login failed: " + oauthData.error + " - " + oauthData.error_description);
			return res.status(401).json({error: "Failed to authenticate discord login."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again"});
	}
});
app.get("/api/logout", async (req, res) => {
	res.clearCookie("userToken");
	return res.json({});
});
export const requireUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		let token = req.cookies.userToken;
		if (!token) {
			return res.status(401).json({error: "Not logged in."});
		}
		try {
			const decoded = jwt.verify(token, JWTKey) as any;
			let user = await getUserFromSecret(decoded.id);
			if (!user) {
				return res.status(401).send({error: "User token doesn't correspond to any user."});
			}
			req.body.id = user;
		} catch (err) {
			return res.status(401).send({error: "Invalid user token."});
		}
		return next();
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
};
export const possibleUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		let token = req.cookies.userToken;
		req.body.id = null;
		if (token) {
			try {
				const decoded = jwt.verify(token, JWTKey) as any;
				let user = await getUserFromSecret(decoded.id);
				if (user) {
					req.body.id = user;
				}
			} catch (err) {}
		}
		return next();
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
};
