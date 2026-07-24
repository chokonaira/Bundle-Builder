import type { VercelRequest, VercelResponse } from '@vercel/node'
import products from '../src/data/products.json' with { type: 'json' }

/**
 * Bonus endpoint from the brief: the same catalog JSON, served by a tiny
 * backend. The client renders from its local copy first and swaps in this
 * response when it arrives, so environments without the function (Docker,
 * plain `vite preview`) work identically.
 */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).json(products)
}
