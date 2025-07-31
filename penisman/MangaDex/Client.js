export default class Client {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const URL = this.baseURL + endpoint;

        const res = await fetch(URL, {
            method: options.method || "GET",
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            ...(optioons.body ? { body: JSON.stringify(options.body) } : {}),
        });

        if(!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);

        return res.json();
    }
};