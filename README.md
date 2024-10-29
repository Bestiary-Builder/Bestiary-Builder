# Bestiary Builder

Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!

Currently available at [bestiarybuilder.com](https://bestiarybuilder.com)

## Support

You can support the development of Bestiary Builder, and at the same time gain special perks, by supporting us on [Patreon](https://www.patreon.com/BestiaryBuilder).

## Project setup

To start editing the project follow these simple steps:

1. Fork the repository, to have your own editing location. See: [GitHub Docs - Fork a repo](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo)
2. Clone your newly created fork. See: [GitHub Docs - Cloning a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)
3. Install npm dependencies. (Run "npm i" in the backend frontend, and shared folder)
4. Setup outside resources
    - MongoDB:
        - Follow this guide to setup a free MongoDB Atlas cluster: [MongoDB Docs - Deploy free tier cluster](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/)
    - Discord OAuth application:
        - Go [here](https://discord.com/developers/applications) and create a new application.
        - Save the client id and client secret, for use later.
        - Go to "OAuth2"->"General" and add "http://localhost:5173/api/login" to the redirects.
        - Change the constant "clientId" in the file "frontend/main.ts", to match the id for the application.
5. Change the values of ".env" in the frontend folder to your own environment
    - "VITE_DISCORD_ID" should be changed to your Discord OAuth application id.
6. Rename ".env.template" in the backend folder to ".env", and change it's values to your own environment
    - "frontendPath" should stay unchanged. (Unless you moved the folder around)
    - "clientId" should be changed to your Discord OAuth application id.
    - "clientSecret" should be changed to your Discord OAuth application secret.
    - "MongoDB" should be changed to the connection URI for your MongoDB server.
    - "MongoDB_DBName" should be changed to the name of the database to connect to, remove to use "bestiarybuilder".
    - "JWTKEY" should be any string and can be left as is for development.
7. Launch the local site.
    - In VSCode/VSCodium simply press F5 to start the already created launch tasks.
    - For other code editors, start the backend by running "npm run start" in the backend folder, and build the frontend by running "npm run build" in the frontend folder.
8. Check that everything is working as it should.

## Made by

This project was made by [Stevnbak](https://github.com/Stevnbak) and [VeryGreatFrog](https://github.com/VeryGreatFrog)