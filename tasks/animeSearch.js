import { configDb } from '../database/db.js';
import fetch from 'node-fetch';
import { EmbedBuilder } from 'discord.js';
import { request, gql } from 'graphql-request';

const ANILIST_API = 'https://graphql.anilist.co';

export default async function animeSearch(message) {
  if (message.author.bot || !message.guild) return;

  const row = await configDb.get(
    'SELECT channel_id FROM trace_channel WHERE guild_id = ?',
    message.guild.id
  );
  if (!row || message.channel.id !== row.channel_id) return;

  const attachment = message.attachments.first();
  const imageUrl =
    attachment?.url &&
    (attachment?.contentType?.startsWith('image') || /\.(jpe?g|png|webp|gif)$/i.test(attachment?.name))
      ? attachment.url
      : message.content.match(/https?:\/\/\S+\.(jpe?g|png|webp|gif)/i)?.[0] || null;

  if (!imageUrl) return;

  try {
    const res = await fetch(
      `https://api.trace.moe/search?anilistInfo&url=${encodeURIComponent(imageUrl)}`
    );
    const data = await res.json();

    if (!data.result || data.result.length === 0) {
      return message.reply('❌ No anime match found.');
    }

    const result = data.result[0];
    const anime = result.anilist;

    // Get additional data from AniList
    const gqlQuery = gql`
      query ($id: Int) {
        Media(id: $id) {
          description(asHtml: false)
          characters(perPage: 3) {
            nodes {
              name {
                full
              }
              image {
                medium
              }
            }
          }
        }
      }
    `;
    const aniData = await request(ANILIST_API, gqlQuery, { id: anime.id });
    const media = aniData.Media;

    const embed = new EmbedBuilder()
      .setTitle(anime.title?.romaji || 'Unknown Title')
      .setURL(`https://anilist.co/anime/${anime.id}`)
      .setColor('Random')
      .setFooter({ text: 'Powered by trace.moe + AniList' });

    if (anime.title?.english) {
      embed.addFields({ name: 'English Title', value: anime.title.english, inline: true });
    }

    if (anime.title?.native) {
      embed.addFields({ name: 'Japanese Title', value: anime.title.native, inline: true });
    }

    embed.addFields(
      { name: 'Episode', value: result.episode?.toString() || 'Unknown', inline: true },
      { name: 'At', value: formatTime(result.from), inline: true },
      { name: 'Similarity', value: `${(result.similarity * 100).toFixed(2)}%`, inline: true }
    );

    if (result.image) {
      embed.setImage(result.image);
    }

    if (result.video) {
      embed.addFields({
        name: 'Preview',
        value: `[Watch clip](${result.video}&size=l)`
      });
    }

    if (media.description) {
      embed.addFields({
        name: 'Synopsis',
        value: media.description.length > 500 ? media.description.slice(0, 497) + '...' : media.description
      });
    }

    if (media.characters?.nodes?.length) {
      const charNames = media.characters.nodes.map(c => c.name.full).join(', ');
      embed.addFields({ name: 'Top Characters', value: charNames });
    }

    message.reply({ embeds: [embed] });

  } catch (err) {
    console.error('trace.moe error:', err);
    message.reply('⚠️ Error contacting trace.moe or AniList.');
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
