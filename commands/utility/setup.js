import {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} from 'discord.js';

import { setMusicChannel, setNowPlayingMessage } from '../../database/db.js';
import { NowPlayingEmbed } from '../../music/embeds/NowPlayingEmbed.js';
import path from 'path';

export default {
  name: 'setupmusic',
  aliases: ['setup', 'setmusic'],
  category: 'Utility',
  description: 'Set channel for Music',
  usage: 'setupmusic <#channel>',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ You need **Manage Server** permission.');
    }

    let channel = message.mentions.channels.first();

    // Create a new channel if none is provided
    if (!channel) {
      const category = await message.guild.channels.create({
        name: '🎵 Music',
        type: ChannelType.GuildCategory
      });

      channel = await message.guild.channels.create({
        name: 'now-playing',
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: message.guild.id,
            allow: ['ViewChannel', 'SendMessages', 'EmbedLinks']
          }
        ]
      });
    }

    try {
      await setMusicChannel(message.guild.id, channel.id);

      const dummyTrack = {
        title: 'No Track Playing',
        author: 'Idle Mode',
        uri: 'https://example.com',
        length: 0,
        isStream: false,
        identifier: '',
        thumbnail: 'attachment://miku.gif'
      };

      const embedBuilder = new NowPlayingEmbed(dummyTrack);
      const { embed } = await embedBuilder.buildEmbed();

      // Create button row (idle but enabled)
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('music_prev').setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_pause').setEmoji('⏯️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_loop').setEmoji('🔁').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger)
      );

      // Create queue selection menu (empty initially)
      const queue = []; // preload from DB if needed
      const select = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('music_jump')
          .setPlaceholder(queue.length ? '🔽 Jump to track...' : '🔽 Queue is empty')
          .setDisabled(queue.length === 0)
          .addOptions(
            queue.length > 0
              ? queue.slice(0, 25).map((track, i) => ({
                  label: `${i + 1}. ${track.info.title.slice(0, 100)}`,
                  value: i.toString()
                }))
              : [
                  {
                    label: 'No tracks available',
                    value: 'none'
                  }
                ]
          )
      );

      // Send embed with buttons and select
      const sent = await channel.send({
        embeds: [embed],
        files: [{
          attachment: path.resolve('./music/assets/miku.gif'),
          name: 'miku.gif'
        }],
        components: [buttons, select]
      });

      await setNowPlayingMessage(message.guild.id, channel.id, sent.id);

      const confirm = new EmbedBuilder()
        .setTitle('✅ Music Channel Setup Complete')
        .setDescription(`Now Playing embed sent to ${channel}`)
        .setColor(message.member?.displayHexColor || 0x00AE86)
        .setTimestamp();

      await message.channel.send({ embeds: [confirm] });
    } catch (err) {
      console.error(err);
      message.reply('❌ Failed to setup music channel.');
    }
  }
};
