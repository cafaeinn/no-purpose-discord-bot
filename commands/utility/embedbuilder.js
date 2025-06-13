import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

const sessions = new Map();

export default {
  name: 'embedbuilder',
  aliases: ['embuild', 'embd'],
  category: 'Utility',
  description: 'Interactive custom embed builder',
  usage: 'embedbuilder',
  async execute(message) {
    const userId = message.author.id;
    if (sessions.has(userId)) return message.reply('You already have an active embed session.');

    const embedData = {
      title: '',
      description: '\u200b',
      color: '#0099ff',
      thumbnail: '',
      image: '',
      author: { name: '', icon_url: '' },
      footer: { text: '', icon_url: '' },
      fields: [],
    };

    const embed = new EmbedBuilder().setColor(embedData.color).setDescription(embedData.description);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('embed_menu')
      .setPlaceholder('Select part to edit')
      .addOptions([
        new StringSelectMenuOptionBuilder().setLabel('Title').setValue('title'),
        new StringSelectMenuOptionBuilder().setLabel('Description').setValue('description'),
        new StringSelectMenuOptionBuilder().setLabel('Color').setValue('color'),
        new StringSelectMenuOptionBuilder().setLabel('Thumbnail URL').setValue('thumbnail'),
        new StringSelectMenuOptionBuilder().setLabel('Image URL').setValue('image'),
        new StringSelectMenuOptionBuilder().setLabel('Author Name & Icon').setValue('author'),
        new StringSelectMenuOptionBuilder().setLabel('Footer Text & Icon').setValue('footer'),
        new StringSelectMenuOptionBuilder().setLabel('Add Field').setValue('field'),
        new StringSelectMenuOptionBuilder().setLabel('Clear Fields').setValue('clearfields'),
        new StringSelectMenuOptionBuilder().setLabel('Copy JSON').setValue('copyjson'),
      ]);

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('done').setLabel('Done').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger)
    );

    const helpText =
      '**Customize your embed below:**\n' +
      'You can use the following placeholders in any text field:\n' +
      '• `%user.mention%` → Mentions the user\n' +
      '• `%user.tag%` → User\'s full tag\n' +
      '• `%user.name%` → Username only\n' +
      '• `%server.name%` → Server name\n' +
      '• `%server.membercount%` → Total members\n' +
      '• `%avatar%` → User avatar URL\n' +
      '• `%servericon%` → Server icon URL';

    const builderMessage = await message.channel.send({
      content: helpText,
      components: [selectRow, buttonRow],
      embeds: [embed],
    });

    sessions.set(userId, true);

    const selectCollector = builderMessage.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 5 * 60_000,
    });

    const buttonCollector = builderMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60_000,
    });

    selectCollector.on('collect', async (interaction) => {
      if (interaction.user.id !== userId) return interaction.reply({ content: 'Not your session.', ephemeral: true });

      const selected = interaction.values[0];

      if (["title", "description", "color", "thumbnail", "image"].includes(selected)) {
        const modal = new ModalBuilder()
          .setCustomId(`edit-${selected}`)
          .setTitle(`Edit ${selected}`)
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('value')
                .setLabel(`Enter ${selected}`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setValue(embedData[selected] || '')
            )
          );
        return await interaction.showModal(modal);
      }

      if (selected === 'author') {
        const modal = new ModalBuilder()
          .setCustomId('editauthor')
          .setTitle('Edit Author')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('name')
                .setLabel('Author Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setValue(embedData.author.name)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('icon')
                .setLabel('Author Icon URL')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(embedData.author.icon_url)
            )
          );
        return await interaction.showModal(modal);
      }

      if (selected === 'footer') {
        const modal = new ModalBuilder()
          .setCustomId('editfooter')
          .setTitle('Edit Footer')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('text')
                .setLabel('Footer Text')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setValue(embedData.footer.text)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('icon')
                .setLabel('Footer Icon URL')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(embedData.footer.icon_url)
            )
          );
        return await interaction.showModal(modal);
      }

      if (selected === 'field') {
        const modal = new ModalBuilder()
          .setCustomId('addfield')
          .setTitle('Add Field')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('name')
                .setLabel('Field Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('value')
                .setLabel('Field Value')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );
        return await interaction.showModal(modal);
      }

      if (selected === 'clearfields') {
        embedData.fields = [];
        updateEmbed(embed, embedData);
        return await interaction.update({ embeds: [embed] });
      }

      if (selected === 'copyjson') {
        const rawEmbed = {
          title: embedData.title || undefined,
          description: embedData.description || undefined,
          color: parseInt(embedData.color.replace('#', ''), 16),
          thumbnail: embedData.thumbnail ? { url: embedData.thumbnail } : undefined,
          image: embedData.image ? { url: embedData.image } : undefined,
          author: embedData.author.name ? { name: embedData.author.name, icon_url: embedData.author.icon_url || undefined } : undefined,
          footer: embedData.footer.text ? { text: embedData.footer.text, icon_url: embedData.footer.icon_url || undefined } : undefined,
          fields: embedData.fields.length ? embedData.fields : undefined,
        };

        const clean = JSON.parse(JSON.stringify(rawEmbed));

        return await interaction.reply({
          content: '📋 Copy this JSON for your embed:\n```json\n' + JSON.stringify(clean, null, 2) + '\n```',
          ephemeral: true,
        });
      }
    });

    buttonCollector.on('collect', async (interaction) => {
      if (interaction.user.id !== userId)
        return interaction.reply({ content: 'Not your session.', ephemeral: true });

      if (interaction.customId === 'done') {
        sessions.delete(userId);
        return interaction.update({
          content: '✅ Embed building complete.',
          components: [],
          embeds: [embed],
        });
      }

      if (interaction.customId === 'cancel') {
        sessions.delete(userId);
        return interaction.update({
          content: '❌ Embed building cancelled.',
          components: [],
          embeds: [],
        });
      }
    });

    message.client.on('interactionCreate', async (modal) => {
      if (!modal.isModalSubmit()) return;
      if (modal.user.id !== userId) return;

      const [type, key] = modal.customId.split('-');

      if (type === 'edit') {
        embedData[key] = modal.fields.getTextInputValue('value');
        updateEmbed(embed, embedData);
        return await modal.update({ embeds: [embed] });
      }

      if (modal.customId === 'editauthor') {
        embedData.author.name = modal.fields.getTextInputValue('name');
        embedData.author.icon_url = modal.fields.getTextInputValue('icon');
        updateEmbed(embed, embedData);
        return await modal.update({ embeds: [embed] });
      }

      if (modal.customId === 'editfooter') {
        embedData.footer.text = modal.fields.getTextInputValue('text');
        embedData.footer.icon_url = modal.fields.getTextInputValue('icon');
        updateEmbed(embed, embedData);
        return await modal.update({ embeds: [embed] });
      }

      if (modal.customId === 'addfield') {
        const name = modal.fields.getTextInputValue('name');
        const value = modal.fields.getTextInputValue('value');
        embedData.fields.push({ name, value, inline: false });
        updateEmbed(embed, embedData);
        return await modal.update({ embeds: [embed] });
      }
    });
  },
};

function updateEmbed(embed, data) {
  embed.setTitle(data.title || null);
  embed.setDescription(data.description || '\u200b');
  embed.setColor(data.color || '#0099ff');
  embed.setThumbnail(data.thumbnail || null);
  embed.setImage(data.image || null);
  embed.setFooter(data.footer.text ? { text: data.footer.text, iconURL: data.footer.icon_url || null } : null);
  embed.setAuthor(data.author.name ? { name: data.author.name, iconURL: data.author.icon_url || null } : null);
  embed.setFields(data.fields || []);
}
