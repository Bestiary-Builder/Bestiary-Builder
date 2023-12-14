import {app, JWTKey} from "../server";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import {getUser, getUserFromSecret, updateUser, User} from "../database";

app.get("/login", async (req, res) => {
	let code = req.query.code as string;
	console.log(code);
	if (code) {
		try {
			const tokenResponseData = await fetch("https://discord.com/api/oauth2/token", {
				method: "POST",
				body: new URLSearchParams({
					client_id: process.env.clientId ?? "",
					client_secret: process.env.clientSecret ?? "",
					code,
					grant_type: "authorization_code",
					redirect_uri: `http://localhost:5000/login`,
					scope: "identify+email"
				}).toString(),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				}
			});
			const oauthData = (await tokenResponseData.json()) as {
				token_type: string;
				access_token: string;
				error: string;
			};
			if (!oauthData.error) {
				console.log(oauthData);
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
					res.cookie("userToken", token, {expires: new Date(new Date().getTime() + 60 * 60 * 1000 * 24 * 7)});
					//Logged in!
					console.log("User logged in: " + userResult.username);
					res.redirect("/");
				} else {
					res.redirect("/?error=" + encodeURIComponent("No user recieved from discord."));
				}
			} else {
				console.error(oauthData);
				res.redirect("/?error=" + encodeURIComponent("Failed to authenticate discord login."));
			}
		} catch (error) {
			console.error(error);
		}
	} else {
		res.redirect("/?error=" + encodeURIComponent("No code recieved from discord OAuth"));
	}
});
app.get("/logout", async (req, res) => {
	res.clearCookie("userToken");
	res.redirect("/");
});
export const requireUser = async (req: any, res: any, next: any) => {
	let token = req.cookies.userToken;

	if (!token) {
		return res.status(401).json({error: "Not logged in"});
	}
	try {
		const decoded = jwt.verify(token, JWTKey) as any;
		let user = await getUserFromSecret(decoded.id);
		if (!user) {
			return res.status(401).send({error: "Invalid Token (not logged in)"});
		}
		req.body.id = user._id;
	} catch (err) {
		return res.status(401).send({error: "Invalid Token (not logged in)"});
	}
	return next();
};
export const possibleUser = async (req: any, res: any, next: any) => {
	let token = req.cookies.userToken;
	req.body.id = null;
	if (token) {
		try {
			const decoded = jwt.verify(token, JWTKey) as any;
			let user = await getUserFromSecret(decoded.id);
			if (user) {
				req.body.id = user._id;
			}
		} catch (err) {}
	}
	return next();
};

app.get("/api/user", requireUser, async (req, res) => {
	let userData = (await getUser(req.body.id)) as User;
	if (userData) {
		delete userData.secret;
		return res.json(userData);
	} else return res.status(404).json({error: "Couldn't find user"});
});

app.get("/api/user/:id", async (req, res) => {
	let userData = (await getUser(req.params.id)) as User;
	if (userData) {
		let data = {
			_id: userData._id,
			global_name: userData.global_name,
			username: userData.username,
			avatar: userData.avatar,
			banner_color: userData.banner_color
		};
		return res.json(data);
	} else {
		return res.status(404).json({error: "User not found"});
	}
});
