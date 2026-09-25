// 네이버 스마트스토어 상품 반자동 등록 스크립트 (Playwright, 내 PC의 크롬 창에서 실행)
//
// 동작 방식
//  1) 실제 크롬 창을 엽니다. 로그인은 사용자가 직접 합니다(비밀번호를 스크립트에 저장하지 않음).
//  2) 상품마다 등록 화면을 열고 상품명·가격·재고·태그·대표이미지·상세설명(HTML)을 자동으로 입력합니다.
//  3) 자동 입력이 실패한 칸과 옵션·배송·고시 항목은 터미널에 안내된 값을 보고 직접 입력합니다.
//  4) "저장"은 사용자가 확인한 뒤 직접 누릅니다. 스크립트는 저장 버튼을 누르지 않습니다.
//
// 실행: cd automation && npm install && npm run register

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { buildDetailHtml } from './detail.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const productsDir = resolve(here, '../products');
const data = JSON.parse(readFileSync(resolve(productsDir, 'products.json'), 'utf8'));
const CREATE_URL = 'https://sell.smartstore.naver.com/#/products/create';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const waitEnter = (msg) => rl.question(`\n👉 ${msg} (완료되면 Enter) `);

// 여러 후보 셀렉터를 순서대로 시도합니다. 스마트스토어 화면이 바뀌어도 가능한 한 버티도록 만든 것입니다.
async function tryFill(page, label, candidates, value) {
  for (const make of candidates) {
    const loc = make(page).first();
    try {
      await loc.waitFor({ state: 'visible', timeout: 3000 });
      await loc.fill(String(value));
      console.log(`  ✅ ${label} 입력: ${value}`);
      return true;
    } catch { /* 다음 후보 시도 */ }
  }
  console.log(`  ⚠️  ${label} 자동 입력 실패 → 직접 입력: ${value}`);
  return false;
}

// 레이블 텍스트가 있는 행(row) 안의 input을 찾습니다.
const inputNearLabel = (text) => (page) =>
  page.locator(`xpath=//*[normalize-space(text())="${text}"]/ancestor::*[.//input][1]//input[not(@type="checkbox") and not(@type="radio")]`);

// 즉시할인: 판매가 100,000원 - 할인 45,100원 = 할인가 54,900원
async function setDiscount(page, amount, salePrice) {
  try {
    await page.locator('xpath=//*[normalize-space(text())="할인"]/ancestor::*[.//label][1]//label[contains(normalize-space(.),"설정함")]').first().click({ timeout: 3000 });
  } catch { /* 이미 켜져 있거나 화면 구조가 다름 */ }
  const ok = await tryFill(page, '즉시할인 금액(원)', [
    (pg) => pg.getByPlaceholder(/할인/),
    inputNearLabel('기본할인'),
  ], amount);
  if (ok) console.log(`  ℹ️  할인 단위가 "원"인지, 할인가가 ${salePrice.toLocaleString()}원으로 표시되는지 확인하세요`);
}

async function setCategory(page, p) {
  await tryFill(page, '카테고리 검색', [
    (pg) => pg.getByPlaceholder(/카테고리/),
  ], p.categoryKeyword);
  await waitEnter(`카테고리 목록에서 알맞은 세부 카테고리를 고르세요 (예: 패션잡화 > 여성가방 > ${p.categoryKeyword})`);
}

async function uploadMainImage(page, p) {
  const file = resolve(productsDir, p.images.main);
  if (!existsSync(file)) {
    console.log(`  ⚠️  대표이미지 파일이 없습니다: ${file}`);
    return;
  }
  try {
    const chooser = page.waitForEvent('filechooser', { timeout: 5000 });
    await page.locator('xpath=//*[contains(normalize-space(.),"대표이미지")]/ancestor::*[.//button][1]//button').first().click();
    await (await chooser).setFiles(file);
    console.log('  ✅ 대표이미지 업로드');
  } catch {
    console.log(`  ⚠️  대표이미지 자동 업로드 실패 → 직접 업로드: ${file}`);
  }
  const extras = (p.images.extra || []).map((f) => resolve(productsDir, f)).filter(existsSync);
  if (extras.length) console.log(`  ℹ️  추가이미지는 직접 올려 주세요 (권장 순서대로):\n     ${extras.join('\n     ')}`);
}

async function fillDetail(page, html) {
  try {
    await page.getByText('HTML 작성', { exact: false }).first().click({ timeout: 4000 });
    await page.locator('textarea').last().fill(html, { timeout: 4000 });
    console.log('  ✅ 상세설명(HTML) 입력');
  } catch {
    console.log('  ⚠️  상세설명 자동 입력 실패 → products/out 폴더의 HTML을 복사해 "HTML 작성" 탭에 붙여넣으세요');
  }
}

async function fillTags(page, tags) {
  try {
    const input = page.getByPlaceholder(/태그/).first();
    await input.waitFor({ state: 'visible', timeout: 4000 });
    for (const t of tags) {
      await input.fill(t);
      await input.press('Enter');
      await page.waitForTimeout(300);
    }
    console.log(`  ✅ 태그 ${tags.length}개 입력`);
  } catch {
    console.log(`  ⚠️  태그 자동 입력 실패 → 직접 입력: ${tags.join(', ')}`);
  }
}

function printManualChecklist(p, common) {
  const opt = Object.entries(p.options).map(([k, v]) => `     - ${k}: ${v.join(', ')}`).join('\n');
  console.log(`
  ── 직접 확인·입력할 항목 ─────────────────────────────
  [옵션] 조합형 옵션 사용
${opt}
     - 직접입력형 옵션: ${p.textOption}
  [가격] 판매가 ${data.common.price.toLocaleString()}원 · 즉시할인 ${(data.common.price - data.common.salePrice).toLocaleString()}원(원 단위) → 할인가 ${data.common.salePrice.toLocaleString()}원
  [배송] 배송속성 = "주문 확인 후 제작", 발송 소요일 = ${common.shippingDays}일
  [상품주요정보] 브랜드·제조사: 계정에 설정된 값 확인 / 모델명: ${p.modelName} / 원산지: ${common.origin}
  [상품정보제공고시] 가방 카테고리 항목 전체 입력
  [반품/교환] 맞춤 제작 상품의 청약철회 제한 문구 입력:
     "${common.customNotice}"
  [검색설정] 태그가 10개 모두 들어갔는지 확인
  ────────────────────────────────────────────────────`);
}

async function registerOne(page, p) {
  console.log(`\n━━━ ${p.id}: ${p.name} (${p.name.length}자) ━━━`);
  await page.goto(CREATE_URL);
  await page.waitForLoadState('networkidle').catch(() => {});

  await setCategory(page, p);
  await tryFill(page, '상품명', [(pg) => pg.getByPlaceholder(/상품명/), inputNearLabel('상품명')], p.name);
  const { price, salePrice } = data.common;
  await tryFill(page, '판매가', [(pg) => pg.getByPlaceholder(/판매가/), inputNearLabel('판매가')], price);
  await setDiscount(page, price - salePrice, salePrice);
  await tryFill(page, '재고수량', [(pg) => pg.getByPlaceholder(/재고/), inputNearLabel('재고수량')], data.common.stock);
  await uploadMainImage(page, p);

  const html = buildDetailHtml(p, data.common);
  mkdirSync(resolve(productsDir, 'out'), { recursive: true });
  writeFileSync(resolve(productsDir, 'out', `${p.id}.html`), html);
  await fillDetail(page, html);
  await fillTags(page, p.tags);

  printManualChecklist(p, data.common);
  await waitEnter('화면에서 모든 항목을 확인한 뒤 직접 [저장하기]를 누르세요. 다음 상품으로 넘어갑니다');
}

const context = await chromium.launchPersistentContext(resolve(here, '.chrome-profile'), {
  channel: 'chrome', // PC에 설치된 크롬 사용. 크롬이 없으면 이 줄을 지우세요.
  headless: false,
  viewport: null,
  args: ['--start-maximized'],
});
const page = context.pages()[0] ?? (await context.newPage());
await page.goto('https://sell.smartstore.naver.com/');
await waitEnter('열린 크롬 창에서 스마트스토어센터에 로그인하세요');

const only = process.argv[2]; // 예: npm run register -- product2
for (const p of data.products.filter((x) => !only || x.id === only)) {
  await registerOne(page, p);
}
console.log('\n🎉 모든 상품 처리 완료. 스마트스토어센터 > 상품조회/수정에서 등록 결과를 확인하세요.');
rl.close();
await context.close();
