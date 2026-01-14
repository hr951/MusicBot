const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Connectors } = require('shoukaku');
const { Kazagumo } = require('kazagumo');
const path = require('node:path');
const fs = require('node:fs');
require("dotenv").config();
require("./server.js");

const token = process.env.DISCORD_BOT_TOKEN;
const PREFIX = "!";
const Nodes = [{
    name: 'Render-Node',
    url: process.env.LAVA_LINK_URL, // URL (PORT -> 443)
    auth: process.env.LAVA_LINK_AUTH, // パスワード
    secure: true // HTTPS(443) -> true
}];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
    ]
});

// ----- Kazagumo初期化 -----
const kazagumo = new Kazagumo({
    defaultSearchEngine: "soundcloud",
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    }
}, new Connectors.DiscordJS(client), Nodes);

kazagumo.on("playerStart", (player, track) => {
    player.data.get("textChannel").send(`再生中: **${track.title}**`);
});

client.kazagumo = kazagumo;
client.kazagumo.shoukaku.on('ready', (name) => console.log(`Lavalink Node: ${name} が接続されました！`));
// ----- Kazagumo初期化終了 -----

// ---- コマンド読み込み処理 ----
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`${filePath} に必要な "data" か "execute" がありません。`);
    }
}

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`${interaction.commandName} が見つかりません。`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            try {
                await interaction.reply({ content: 'error', ephemeral: true });
                console.error(error);
            } catch (error) {
                console.error(error);
            }
        }
    };
});
// ---- コマンド読み込み処理終了 ----

// 誰かがボイスチャンネルからいなくなった時の処理
client.on("voiceStateUpdate", (oldState, newState) => {
    const player = kazagumo.players.get(oldState.guild.id);
    if (!player) return;

    const voiceChannel = client.channels.cache.get(player.voiceId);
    if (voiceChannel && voiceChannel.members.filter(m => !m.user.bot).size === 0) {
        player.destroy();
        const textChannel = client.channels.cache.get(player.textId);
        if (textChannel) textChannel.send("誰もいなくなったので退出しました");
    }
});

client.login(token);
