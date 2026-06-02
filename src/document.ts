import { FetchFn } from './types.js';

export class Document {
    private _host: string;
    private _token: string;
    private _fetch: FetchFn;
    private _endpoint: string;
    private _batchEndpoint: string;
    public FORMATS: string[];

    constructor(host: string, token: string, fetchFn: FetchFn) {
        this._host = host;
        this._token = token;
        this._fetch = fetchFn;
        this._endpoint = '/api/documents';
        this._batchEndpoint = '/api/documents/commands';
        this.FORMATS = ['md', 'html', 'json'];
    }

    async get(secret: string, format: string = 'md'): Promise<any> {
        if (!secret) {
            throw new Error('Get Document. Secret is missing.');
        }

        if (!this.FORMATS.includes(format)) {
            throw new Error(`Get Document. '${format}' format is not supported yet. Try ${this.FORMATS.join(',')}`);
        }

        const url = new URL(`https://${this._host}${this._endpoint}/${secret}`);
        url.searchParams.append('format', format);

        const response = await this._fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Token ${this._token}`,
                'X-Client': 'Unofficial JS',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        return response.json();
    }

    async getBatch(secrets: string[], format: string = 'md'): Promise<any> {
        if (!this.FORMATS.includes(format)) {
            throw new Error(`Get Documents. '${format}' format is not supported yet. Try ${this.FORMATS.join(',')}`);
        }

        const url = new URL(`https://${this._host}${this._batchEndpoint}`);
        url.searchParams.append('format', format);

        const response = await this._fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Authorization': `Token ${this._token}`,
                'X-Client': 'Unofficial JS',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                command: 'get-documents',
                args: secrets
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        return response.json();
    }

    async update(secret: string, content: string, format: string = 'md'): Promise<any> {
        if (!secret) {
            throw new Error('Get Document. Secret is missing.');
        }

        if (!this.FORMATS.includes(format)) {
            throw new Error(`Get Document. '${format}' format is not supported yet. Try ${this.FORMATS.join(',')}`);
        }

        const url = new URL(`https://${this._host}${this._endpoint}/${secret}`);
        url.searchParams.append('format', format);

        const response = await this._fetch(url.toString(), {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${this._token}`,
                'X-Client': 'Unofficial JS',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        return response.json();
    }
}

export default Document;
