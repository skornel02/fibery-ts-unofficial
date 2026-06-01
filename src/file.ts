import fs from 'node:fs';

export class File {
    private _host: string;
    private _token: string;
    private _filesEndpoint: string;
    private _fetch: typeof fetch;

    constructor(host: string, token: string, fetchFn: typeof fetch) {
        this._host = host;
        this._token = token;
        this._filesEndpoint = '/api/files';
        this._fetch = fetchFn;
    }

    async upload(path: string): Promise<any> {
        if (!path) {
            throw new Error('Upload File. Path is missing.');
        }

        const formData = new FormData();
        const fileContent = await fs.promises.readFile(path);
        const blob = new Blob([fileContent]);
        const filename = path.split(/[\\/]/).pop() || 'file';
        formData.append('file', blob, filename);

        const response = await this._fetch('https://' + this._host + this._filesEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${this._token}`,
                'X-Client': 'Unofficial JS'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        return response.json();
    }

    async download(secret: string, destination: string): Promise<void> {
        if (!secret) {
            throw new Error('Download File. Secret is missing.');
        }

        if (!destination) {
            throw new Error('Download File. Destination is missing.');
        }

        const response = await this._fetch('https://' + this._host + this._filesEndpoint + `/${secret}`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${this._token}`,
                'X-Client': 'Unofficial JS'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        await fs.promises.writeFile(destination, Buffer.from(arrayBuffer));
    }
}

export default File;
