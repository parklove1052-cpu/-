# 맞춤 제작 가방 — 스마트스토어 상품 등록 도구

- `docs/strategy.md` — CTR · CTA · SEO 전략 (등록 전 기준)
- `products/products.json` — 상품 3개(도안별) 등록 데이터: 상품명, 가격, 태그, 옵션, 상세 문구
- `products/images/product1~3/` — 이미지를 넣는 폴더 (`main.jpg` = 대표이미지, 1000×1000 이상, 텍스트 없음)
- `automation/` — 내 PC 크롬에서 실행하는 Playwright 반자동 등록 스크립트

## 사용 방법 (내 PC에서)

1. [Node.js](https://nodejs.org) LTS와 크롬을 설치합니다.
2. 브랜드는 스마트스토어 계정 설정값을 씁니다. `products/products.json`의 가격·소재·사이즈가 실제 제품과 맞는지 확인합니다.
3. 대표이미지를 `products/images/product1/main.jpg`처럼 넣습니다. 추가이미지는 같은 폴더에 넣고 `images.extra`에 경로를 적습니다.
   상세페이지 이미지는 외부 URL(이미지 호스팅)이 있으면 `images.detailUrls`에 넣고, 없으면 등록 화면에서 직접 올립니다.
4. 미리보기: `cd automation && npm install && npm run preview` → `products/out/*.html`을 브라우저로 엽니다.
5. 등록: `npm run register` (상품 하나만 등록: `npm run register -- product2`)
   - 크롬 창이 열리면 **직접 로그인**하고 터미널에서 Enter를 누릅니다.
   - 카테고리를 고르면 상품명, 가격, 재고, 대표이미지, 상세설명, 태그가 자동으로 입력됩니다.
   - 터미널에 나오는 체크리스트(옵션, 배송 "주문 확인 후 제작", 상품정보제공고시, 반품 제한 고지)를 보고 나머지를 입력합니다.
   - 확인이 끝나면 **저장 버튼은 직접** 누릅니다.

> 스마트스토어 화면 구조는 자주 바뀝니다. 자동 입력에 실패한 칸은 터미널에 `⚠️`와 입력할 값이 표시되니, 그 값으로 직접 입력하면 됩니다.
