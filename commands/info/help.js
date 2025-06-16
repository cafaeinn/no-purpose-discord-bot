import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';

export default {
  name: 'help',
  aliases: ['h'],
  category: 'Info',
  description: 'Shows all commands or details of a specific command.',
  usage: 'help [command]',
  async execute(message, args, client) {
    const commands = [...client.commands.values()];
    const unique = new Map();
    const userColor = message.member?.displayHexColor || 'Blurple';

    for (const cmd of commands) {
      if (!unique.has(cmd.name)) unique.set(cmd.name, cmd);
    }

    if (args.length) {
      const name = args[0].toLowerCase();
      const command =
        unique.get(name) ||
        [...unique.values()].find((cmd) => cmd.aliases?.includes(name));

      if (!command) {
        return message.reply(`❌ Command \`${name}\` not found.`);
      }

      const embed = new EmbedBuilder()
        .setTitle(`📘 Command: ${command.name}`)
        .setColor(userColor)
        .addFields(
          { name: 'Description', value: command.description || 'No description', inline: false },
          { name: 'Usage', value: `\`${command.usage || 'No usage info'}\``, inline: false },
          { name: 'Aliases', value: command.aliases?.map((a) => `\`${a}\``).join(', ') || 'None', inline: false },
          { name: 'Category', value: command.category || 'Other', inline: false }
        )
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      return message.reply({ embeds: [embed] });
    }

    // Group commands by category
    const grouped = {};
    for (const cmd of unique.values()) {
      const cat = cmd.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cmd);
    }

    const categories = Object.keys(grouped);

    // Page 1 — overview
    const summaryEmbed = new EmbedBuilder()
      .setTitle('📖 Help - Overview')
      .setColor(userColor)
      .setDescription('List of all command\n\nUse the buttons below to list commands by category.')
      .addFields(
        categories.map(cat => ({
          name: cat,
          value: grouped[cat].map(cmd => `\`${cmd.name}\``).join(', '),
          inline: false,
        }))
      )
      .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    // Other pages — per category
    const categoryEmbeds = categories.map((cat, i) => {
      const cmds = grouped[cat];
      return new EmbedBuilder()
        .setTitle(`📂 ${cat} Commands`)
        .setColor(userColor)
        .setDescription(cmds.map(cmd =>
          `**\`${cmd.name}\`** — ${cmd.description || 'No description.'}`
        ).join('\n'))
        .setFooter({ text: `Page ${i + 2} of ${categories.length + 1}` });
    });

    const pages = [summaryEmbed, ...categoryEmbeds];
    let page = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('prev').setLabel('⬅️ Prev').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('next').setLabel('Next ➡️').setStyle(ButtonStyle.Secondary)
    );

    const msg = await message.reply({ embeds: [pages[page]], components: [row] });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 90_000,
    });

    collector.on('collect', (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: '❌ Only the requester can use these buttons.', ephemeral: true });
      }

      interaction.deferUpdate();

      if (interaction.customId === 'prev') {
        page = (page - 1 + pages.length) % pages.length;
      } else {
        page = (page + 1) % pages.length;
      }

      msg.edit({ embeds: [pages[page]], components: [row] });
    });

    collector.on('end', () => {
      msg.edit({ components: [] });
    });
  },
};
