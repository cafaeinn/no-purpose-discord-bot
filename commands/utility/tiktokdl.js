export default {
  name: 'tiktokdl',
  aliases: ['ttdl'],
  category: 'Utility',
  description: 'Download a videos from tiktok',
  usage: 'tiktokdl <url>',
  async execute(message, args) {
    const scraperModule = await import('@xct007/tiktok-scraper');
    const { default: TikTokScraper, someUtility } = scraperModule
    const url = args[0];

    let result = await TikTokScraper(url, { parse: true, keys: ['desc_language']});
		//result.download.nowm
		message.reply({
			files: [{
				attachment: result.download.nowm,
				name: `default.mp4`
			}]
		})
}
};
