import Client from './Client.js';

export default class MangaDex extends Client {
    constructor() {
        super('https://api.mangadex.org');
    }

    async search(title, limit = 5) {
        const params = new URLSearchParams({ title, limit });
        const data = await this.request(`/manga?${params.toString()}`);
        return data.data.map(manga => ({
            id: manga.id,
            title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
            status: manga.attributes.status,
        }));
    }

    async getManga(id) {
        const data = await this.request(`/manga/${id}`);
        const manga = data.data;
        return {
            id: manga.id,
            title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
            description: manga.attributes.description.en || 'No description',
            tags: manga.attributes.tags.map(tag => tag.attributes.name.en),
            status: manga.attributes.status,
        };
    }

    async getChapters(mangaId, limit = 5) {
        const params = new URLSearchParams({
            manga: mangaId,
            'translatedLanguage[]': 'en',
            'order[chapter]': 'desc',
            limit,
        });

        const data = await this.request(`/chapter?${params.toString()}`);
        return data.data.map(ch => ({
            id: ch.id,
            chapter: ch.attributes.chapter,
            title: ch.attributes.title || '(No Title)',
            pages: ch.attributes.pages,
            publishAt: ch.attributes.publishAt,
        }));
    }

    async getCoverArt(mangaId) {
        const data = await this.request(`/manga/${mangaId}`);
        const cover = data.data.relationships.find(r => r.type === 'cover_art');
        return cover
            ? `https://uploads.mangadex.org/covers/${mangaId}/${cover.attributes.fileName}`
            : null;
    }
}
