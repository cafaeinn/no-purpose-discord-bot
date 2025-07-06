import { Events } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.inGuild()) return;

    const guildId = interaction.guildId;
    const music = client.music;

    if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'music_prev':
          music.previous(guildId);
          return interaction.reply({ content: '⏮️ Playing previous track', ephemeral: true });

        case 'music_pause':
          music.pause(guildId);
          return interaction.reply({ content: '⏯️ Paused/Resumed', ephemeral: true });

        case 'music_skip':
          music.skip(guildId);
          return interaction.reply({ content: '⏭️ Skipped', ephemeral: true });

        case 'music_loop':
          const curr = music.getLoopMode(guildId);
          const next = curr === 'off' ? 'track' : curr === 'track' ? 'queue' : 'off';
          music.setLoopMode(guildId, next);
          return interaction.reply({ content: `🔁 Loop mode: **${next}**`, ephemeral: true });

        case 'music_stop':
          music.stop(guildId);
          return interaction.reply({ content: '⏹️ Stopped playback', ephemeral: true });

        default:
          return;
      }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'music_jump') {
      const index = parseInt(interaction.values[0], 10);
      music.jumpTo(guildId, index);
      return interaction.reply({ content: `🎶 Jumped to track #${index + 1}`, ephemeral: true });
    }
  }
};
