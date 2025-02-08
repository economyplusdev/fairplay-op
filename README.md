# Fairplay x Minecraft Bedrock Realms

# What is a "Realm"
A realm is a Minecraft Bedrock server that is hosted by Mojang. It is a subscription based service that allows you to play with friends and family in a private world.

# What is Fairplay
Fairplay is a application for Minecraft Bedrock realms. 
The intended use case for this application is to allow people to manage, view, and track things about their minecraft bedrock realms from Discord/on the web.

# History
Fairplay initially started off as a simple .mcfunction based anticheat for the economyplus server in 2019, later expanding to a discord webhook based for live chat intigration with discord, and then coming out with a full fledged Automod later in 2020. 

# Ports
 -> Backend http://localhost:1112
 -> Frontend http://localhost:1113
-> Websocket http://localhost:1114
 -> MongoDB mongodb://127.0.0.1:27017
 -> FairplayShard #1 http://localhost:4444

# How does this work? 
Fairplay is built around a "Main server", that being said the /frontend/ is fully compatable with a vercel/cloudflare worker serverless configuration, with the hindsight in which you understand how to setup such a serverless configuration. 

FairplayShard [#number] is primarily to have it so the "heaviest" part of the bot be able to run on multiple servers to cut costs. That being said the backend has a config.json file in which you will list all your FairplayShard backend URL's, and the backend will automatically distribute the load between the shards, based on active usage and server load, that being said the ingame part of Fairplay is "light", with a average of 25Mb's of memory being used per process/realm. The biggest potential bottle neck is the actual websocket in which the shards use to communicate with the actual backend server. Currently we have tested it with over 25,000 active connections without any serious issues, but that being said it is still a potential bottle neck.

The discord bot is nothing more than a process in which accepts interactionCreate events from from discord, in which are sent to the backend server, and then the backend server generates the embed in accordance with the translations/realmData/etc and sends it back to the discord bot, in which then sends it to the user.

This project is built with the intention of being able to be ran on a single server, or multiple servers, with the ability to scale up to 75 commands run per second, with the ability to scale up to 2,000 active connections. (Tested on a 18 core, 64Gb of ram server)