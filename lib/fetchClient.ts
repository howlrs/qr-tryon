export class FetchError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'FetchError';
        this.status = status;
    }
}

export async function fetchClient<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    let res: Response;

    try {
        res = await fetch(url, options);
    } catch {
        throw new FetchError(
            'ネットワーク接続を確認してください。',
            0
        );
    }

    if (!res.ok) {
        if (res.status === 429) {
            const data = await res.json().catch(() => ({}));
            throw new FetchError(
                data.message || 'リクエストが多すぎます。しばらく待ってからお試しください。',
                429
            );
        }

        if (res.status >= 500) {
            throw new FetchError(
                'サーバーエラーが発生しました。時間をおいて再度お試しください。',
                res.status
            );
        }

        // 4xx client errors
        const data = await res.json().catch(() => ({}));
        throw new FetchError(
            data.message || 'リクエストに問題がありました。',
            res.status
        );
    }

    return res.json() as Promise<T>;
}
