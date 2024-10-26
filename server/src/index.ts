import cors from 'cors';
import express, { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import redis from './lib/redis';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

interface ShortLink {
  longUrl: string;
  createdAt: number;
  updatedAt?: number;
}

// @ts-ignore
app.post('/api/links', async (req: Request, res: Response) => {
  const { longUrl, customShortCode } = req.body as {
    longUrl: string;
    customShortCode?: string;
  };
  const shortCode = customShortCode || nanoid(6);

  // Check if the shortCode already exists
  const exists = await redis.exists(`shortlink:${shortCode}`);
  if (exists) {
    return res.status(400).json({ error: 'Short code already exists' });
  }

  await redis.hset(`shortlink:${shortCode}`, {
    longUrl,
    createdAt: Date.now(),
  });
  res.json({ shortCode, longUrl });
});

app.get('/api/links', async (_req: Request, res: Response) => {
  const keys = await redis.keys('shortlink:*');
  const links = await Promise.all(
    keys.map(async (key: string) => {
      const data = await redis.hgetall(key);
      return { shortCode: key.split(':')[1], ...data } as ShortLink & {
        shortCode: string;
      };
    }),
  );
  res.json(links);
});

app.put(
  '/api/links',
  // @ts-ignore
  async (
    req: express.Request<{}, {}, { shortCode: string; longUrl: string }>,
    res: express.Response,
  ) => {
    try {
      const { shortCode, longUrl } = req.body;

      const exists = await redis.exists(`shortlink:${shortCode}`);
      if (!exists) {
        return res.status(404).json({ error: 'Short link not found' });
      }
      await redis.hset(`shortlink:${shortCode}`, {
        longUrl,
        updatedAt: Date.now(),
      });
      res.json({ shortCode, longUrl });
    } catch (error) {
      console.error('Error updating short link:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

app.delete(
  '/api/links',
  async (req: Request<{}, {}, { shortCode: string }>, res: Response) => {
    const { shortCode } = req.body;
    const deleted = await redis.del(`shortlink:${shortCode}`);
    res.json({ success: deleted > 0 });
  },
);

app.get(
  '/:shortcode',
  async (req: Request<{ shortcode: string }>, res: Response) => {
    const { shortcode } = req.params;
    const longUrl = await redis.hget(`shortlink:${shortcode}`, 'longUrl');
    if (longUrl) {
      res.redirect(longUrl);
    } else {
      res.redirect('/');
    }
  },
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
