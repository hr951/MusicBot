const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("現在再生中の曲を表示します"),

    async execute(interaction) {

        const kazagumo = interaction.client.kazagumo;
        const player = kazagumo.players.get(interaction.guild.id);

        if (!interaction.guild) return;

        if (!kazagumo.shoukaku.nodes.size) {
            return interaction.reply("再生サーバーに接続できていません。\n少し待ってからやり直してください。");
        }

        if (!player) return interaction.reply("再生中の曲がありません");
        return interaction.reply(`再生中: **${player.queue.current.title}**`);
    },
};