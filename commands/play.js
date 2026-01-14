const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("曲を再生します")
    .addStringOption(option =>
      option
        .setName("query")
        .setDescription("URL または 検索ワード")
        .setRequired(true)
    ),

  async execute(interaction) {

    const kazagumo = interaction.client.kazagumo;
    const query = interaction.options.getString('query');

    if (!interaction.guild) return;
    if (!interaction.member.voice.channel) return interaction.reply("VCに入ってください");

    if (!kazagumo.shoukaku.nodes.size) {
      return interaction.reply("再生サーバーに接続できていません。\n少し待ってからやり直してください。");
    }

    await interaction.deferReply();

    try {
      let res = await kazagumo.search(query);
      if (!res.tracks.length) return interaction.editReply("見つかりませんでした");

      const newPlayer = await kazagumo.createPlayer({
        guildId: interaction.guild.id,
        textId: interaction.channel.id,
        voiceId: interaction.member.voice.channel.id,
        deaf: true
      });

      newPlayer.data.set("textChannel", interaction.channel);
      newPlayer.queue.add(res.tracks[0]);
      if (!newPlayer.playing && !newPlayer.paused) newPlayer.play();
      return interaction.editReply(`**${res.tracks[0].title}**をキューに追加しました`);
    } catch (error) {
      console.error(error);
      return interaction.editReply("曲の再生中にエラーが発生しました。");
    }

  },
};