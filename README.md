# Bestiary Builder
Description bla bla bla...

Currently available at [bestiary.stevnbak.dk](https://bestiary.stevnbak.dk)

## Support
You can support the development of Bestiary Builder, and at the same time gain special perks, by subscribing on [Patreon](https://www.patreon.com/BestiaryBuilder).

## Project setup
To start editing the project follow these simple steps:
1. Fork the repository, to have your own editing location. See: [GitHub Docs - Fork a repo](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo)
2. Clone your newly created fork. See: [GitHub Docs - Cloning a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)
3. Install npm dependencies. (Run "npm i" in both the backend and frontend folder)
4. Setup outside resources
    - MongoDB:
        - Follow this guide to setup a free MongoDB Atlas cluster: [MongoDB Docs - Deploy free tier cluster](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/)
    - Discord OAuth application:
        - Go [here](https://discord.com/developers/applications) and create a new application.
        - Save the client id and client secret, for use later.
        - Go to "OAuth2"->"General" and add "http://localhost:5000/user" to the redirects.
6. Rename ".env.template" in the backend folder to ".env", and change it's values to your own environment
    - "frontendPath" should stay unchanged. (Unless you moved the folder around)
    - "NODE_ENV" should stay unchanged.
    - "clientId" should be changed to your Discord OAuth application id.
    - "clientSecret" should be changed to your Discord OAuth application secret.
    - "discordRedirectURI" should stay unchanged. (Unless you changed the hostname or port of the local site)
    - "MongoDB" should be changed to the connection URI for your MongoDB database.
7. Launch the local site.
    - In VSCode/VSCodium simply press F5 to start the already created launch tasks.
    - For other code editors, start the backend by running "npm run start" in the backend folder, and build the frontend by running "npm run build" in the frontend folder.
9. Check that everything is working as it should.

## Made by
This project was made by [Stevnbak](https://github.com/Stevnbak) and [VeryGreatFrog](https://github.com/VeryGreatFrog)
