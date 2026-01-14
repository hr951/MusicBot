const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("ループモードを設定します")
        .addStringOption(option =>
            option.setName("mode")
                .setDescription("ループモード")
                .setRequired(true)
                .addChoices(
                    { name: "off", value: "none" },
                    { name: "track", value: "track" },
                    { name: "queue", value: "queue" }
                )
        ),

    async execute(interaction) {

        const kazagumo = interaction.client.kazagumo;
        const player = kazagumo.players.get(interaction.guild.id);
        const mode = interaction.options.getString('mode');

        if (!interaction.guild) return;

        if (!kazagumo.shoukaku.nodes.size) {
            return interaction.reply("再生サーバーに接続できていません。\n少し待ってからやり直してください。");
        }

        if (!player) return interaction.reply("再生中の曲がありません");
        player.setLoop(mode);
        return interaction.reply(`ループモードを **${mode}** に設定しました`);
    },
};