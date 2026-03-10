import { z } from 'zod';

const ALLOWED_IMAGE_DOMAINS = [
  'images.unsplash.com',
] as const;

export const ALLOWED_DOMAINS = ALLOWED_IMAGE_DOMAINS;

export const imageUrlSchema = z
  .string()
  .url('有効なURLを入力してください')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return false;
      return ALLOWED_IMAGE_DOMAINS.some(domain => parsed.hostname === domain);
    } catch { return false; }
  }, { message: '許可されたドメインのURLのみ使用可能です' })
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return !/^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname);
    } catch { return false; }
  }, { message: 'IPアドレスによる直接指定は許可されていません' });
