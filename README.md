# discord-bot

This discord bot allows you to display clash of clans war infos on your discord server.

## How to use

- `node install` to install the dependencies
- Create a `.env` file following the `.env.template` template and fill the values
- `node deploy-commands.js` to deploy the commands on the discord server
- `node .` to start the server 🚀

## Features

- `/ping` command returns the server latency
- `/infos-guerre` command is an admin command that displays informations of the current war of the clan (clan tag must be written in the `.env` file). This message comes with a refresh button.
- `/liste-joueurs` command is an admin command that displays a list of player. This message comes with add, remove & enable/disable notifications button.
- Automatic alert when clan wars start
- Automatic alert for members with notifications enabled when clan wars are about to end
