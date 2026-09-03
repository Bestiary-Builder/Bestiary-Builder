# Bestiary Builder

Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!

Currently available at [bestiarybuilder.com](https://bestiarybuilder.com)

## Support

You can support the development of Bestiary Builder, and at the same time gain special perks, by supporting us on [Patreon](https://www.patreon.com/BestiaryBuilder).

## Project setup

To start editing the project follow these simple steps:

1. Fork the repository, to have your own editing location. See: [GitHub Docs - Fork a repo](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo)
2. Clone your newly created fork. See: [GitHub Docs - Cloning a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)
3. Install npm dependencies. (Run `npm i` in the project root)
4. Setup outside resources
    - Discord OAuth application:
        - Go [here](https://discord.com/developers/applications) and create a new application.
        - Save the client id and client secret, for use later.
        - Go to "OAuth2"->"General" and add "http://localhost:5173/api/login" to the redirects.
        - Change the constant "clientId" in the file "frontend/main.ts", to match the id for the application.
5. Duplicate and rename ".env.template" in the frontend folder to ".env", and change the values of ".env" in the frontend folder to your own environment
    - "VITE_DISCORD_ID" should be changed to your Discord OAuth application id.
6. Start PostgreSQL database
	- Run `docker compose up -d` in the project folder
	- *(or start a PosgreSQL database in any other way)*
7. Duplicate and rename ".env.template" in the backend folder to ".env", and change it's values to match your own environment, following the table below.
8. Update local database to match the current schema by running `npm run migrate -w backend && npm run generate -w backend`.
9. Launch the local site.
    - In VSCode/VSCodium simply press F5 to start the already created launch tasks.
    - For other code editors, start both the backend and the frontend together by running "npm run dev" in the project root.
10. Check that everything is working as it should.

### Environment variables

The backend environment variables are configured in `backend/.env`. Copy `backend/.env.template` to `backend/.env` and update the values for your environment.

| Variable | Required | Template value | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `postgresql://postgres:password@localhost:5432/bestiarybuilder?schema=public` | PostgreSQL connection URL. The template value matches the database provided by `docker compose`. |
| `frontendPath` | Yes | `../build/frontend` | Path to the built frontend files. Keep the default unless the frontend build directory has moved. |
| `clientId` | Yes | — | Discord OAuth2 client ID used for authentication. |
| `clientSecret` | Yes | — | Discord OAuth2 client secret. |
| `JWTKEY` | Yes | `r4nd0m` | Secret used to sign JSON Web Tokens. Any string is sufficient for local development; use a strong, private value in production. |
| `discordBotToken` | No | — | Optional Discord bot authorization token. |
| `SCRIPT_AVRAE_TOKEN` | No | — | Your Avrae token. Leave empty unless you want to use `scripts/createSRDCreatures.py`. |
| `DUMMY_AVRAE_TOKEN` | No | — | Avrae token for a dedicated dummy Discord account used to create gvars, enabling attacks to be copied into Avrae without signing in. Do not use your personal Avrae token. This is not required for development. |
| `ADMIN_ACCOUNTS` | No | — | Comma-separated list of Discord user IDs that should be treated as administrators. |
| `PATREON_ACCESS_TOKEN` | For Patreon integration | — | Patreon creator access token. |
| `PATREON_REFRESH_TOKEN` | For Patreon integration | — | Patreon creator refresh token. |
| `PATREON_CLIENT_ID` | For Patreon integration | — | Patreon OAuth client ID. |
| `PATREON_CLIENT_SECRET` | For Patreon integration | — | Patreon OAuth client secret. |
| `PATREON_WEBHOOK_SECRET` | For Patreon integration | — | Patreon webhook signing secret. |
| `PATREON_CAMPAIGN_ID` | No | — | Optional Patreon campaign ID. Leave empty to discover it automatically. |
| `PATREON_WIRMLING_TIER_ID` | No | — | Optional Patreon Wirmling tier ID. Leave empty to map paid tiers by pledge amount. |
| `PATREON_GREATWYRM_TIER_ID` | No | — | Optional Patreon Greatwyrm tier ID. Leave empty to map paid tiers by pledge amount. |

### After upstream changes

To resume working on the project after upstream changes from other contributors do the following:

1. Pull newest changes from `main` (or `dev` if branching from there)
2. Reinstall npm dependencies, as there might have been updates or changes to these. (Run `npm i` in the project root)
3. Start your PostgreSQL database if it's not already running
	- Run `docker compose up -d` in the project folder
	- *(or start a PosgreSQL database in any other way, and then update .env connection url to match)*
4. Update local database to match the current schema by running `npm run migrate -w backend && npm run generate -w backend`.
5. Launch the local site.
    - In VSCode/VSCodium simply press F5 to start the already created launch tasks.
    - For other code editors, start both the backend and the frontend by running "npm run dev" in the project root.
6. Check that everything is working as it should.

## Made by

This project was made by [Stevnbak](https://github.com/Stevnbak) and [VeryGreatFrog](https://github.com/VeryGreatFrog)