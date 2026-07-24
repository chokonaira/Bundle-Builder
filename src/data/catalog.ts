import type { Catalog } from '../types/catalog'
import raw from './products.json'

/**
 * Local catalog source. The app also exposes this JSON over /api/products
 * (see api/products.ts), and the client falls back to this import when the
 * endpoint isn't available (Docker/offline).
 */
export const catalog = raw as Catalog
