// 스마트스토어에 올리기 전에 상세설명 HTML을 미리 만들어 브라우저에서 확인합니다.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDetailHtml } from './detail.mjs';

const productsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../products');
const data = JSON.parse(readFileSync(resolve(productsDir, 'products.json'), 'utf8'));
mkdirSync(resolve(productsDir, 'out'), { recursive: true });
for (const p of data.products) {
  const file = resolve(productsDir, 'out', `${p.id}.html`);
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><title>${p.name}</title>${buildDetailHtml(p, data.common, data.brand)}`);
  console.log(`${p.id} (${p.name.length}자) → ${file}`);
}
