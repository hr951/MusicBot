const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("再生キューを表示します"),

    async execute(interaction) {

        const kazagumo = interaction.client.kazagumo;
        const player = kazagumo.players.get(interaction.guild.id);

        if (!interaction.guild) return;

        if (!kazagumo.shoukaku.nodes.size) {
            return interaction.reply("再生サーバーに接続できていません。\n少し待ってからやり直してください。");
        }

        if (!player) return interaction.reply("再生中の曲がありません");
        const q = player.queue.map((t, i) => `${i + 1}. ${t.title}`).join("\n");
        return interaction.reply(`📜 **現在のキュー:**\n${q || "空っぽです"}`);
    },
};