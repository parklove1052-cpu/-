// 상세설명 HTML 생성기 — 스마트스토어 상세설명의 "HTML 작성" 탭에 들어갈 HTML을 만듭니다.
// SEO를 위해 이미지뿐 아니라 텍스트 블록(맞춤 항목, 주문 단계, 스펙, 고지)을 반드시 포함합니다.
// 톤: 고급 아틀리에 — 세리프 헤드라인, 아이보리·차콜·골드, 넓은 여백, 과장 문구 없음.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const GOLD = '#9a7b4f';
const INK = '#2b2723';
const serif = "'Nanum Myeongjo','Noto Serif KR',serif";

export function buildDetailHtml(p, common) {
  const d = p.detail;
  // 상세 이미지는 스마트스토어 HTML 모드에서 외부 URL만 쓸 수 있습니다(로컬 파일 불가).
  const imgs = (p.images.detailUrls || [])
    .map((u) => `<img src="${esc(u)}" alt="${esc(p.name)}" style="width:100%;display:block">`)
    .join('\n');
  const custom = [...Object.keys(p.options), p.textOption.replace(/\(.*\)/, '')]
    .map((k) => `<td style="padding:18px 8px;border-top:1px solid ${GOLD};border-bottom:1px solid ${GOLD}">${esc(k)}</td>`)
    .join('');
  const specRows = Object.entries(d.spec)
    .map(([k, v]) => `<tr><th style="padding:12px 8px;width:28%;font-weight:normal;color:${GOLD};border-bottom:1px solid #e6e0d6">${esc(k)}</th><td style="padding:12px 8px;border-bottom:1px solid #e6e0d6">${esc(v)}</td></tr>`)
    .join('');
  const cta = (text) => `<p style="display:inline-block;margin:28px 0;padding:14px 40px;border:1px solid ${INK};letter-spacing:2px;font-size:15px">${text}</p>`;

  return `<div style="max-width:860px;margin:0 auto;padding:0 20px;background:#faf8f4;font-family:'Noto Sans KR',sans-serif;color:${INK};line-height:1.9;text-align:center">
<p style="padding-top:60px;letter-spacing:6px;font-size:12px;color:${GOLD}">MADE TO ORDER · ${esc(p.modelName)}</p>
<h2 style="font-family:${serif};font-size:30px;font-weight:normal;margin:12px 0">${esc(d.headline)}</h2>
<p style="font-size:16px;color:#6b635a">${esc(d.sub)}</p>
${cta('옵션에서 나만의 가방 주문하기')}

<h3 style="font-family:${serif};font-weight:normal;font-size:22px;margin-top:60px">맞춤으로 정할 수 있는 것</h3>
<table style="width:100%;border-collapse:collapse;font-size:15px"><tr>${custom}</tr></table>

<h3 style="font-family:${serif};font-weight:normal;font-size:22px;margin-top:60px">주문 과정</h3>
<p>I. 가죽 색상과 디테일 선택　II. 각인 문구 입력　III. 약 ${common.shippingDays}일간 수작업 제작 후 발송</p>
<p style="color:${GOLD}">사이즈·스트랩 길이·로고 등 옵션 밖의 맞춤은 톡톡 1:1 상담으로 제작합니다.</p>

${imgs}

<h3 style="font-family:${serif};font-weight:normal;font-size:22px;margin-top:60px">Details</h3>
<table style="width:100%;border-collapse:collapse;text-align:left;font-size:15px">${specRows}
<tr><th style="padding:12px 8px;font-weight:normal;color:${GOLD};border-bottom:1px solid #e6e0d6">제작</th><td style="padding:12px 8px;border-bottom:1px solid #e6e0d6">${esc(common.origin)} · 주문 후 수작업 제작 (약 ${common.shippingDays}일)</td></tr></table>

<h3 style="font-family:${serif};font-weight:normal;font-size:20px;margin-top:60px">맞춤 제작 안내</h3>
<p style="font-size:13px;color:#8a8279">${esc(common.customNotice)}</p>
${cta('나만의 가방 주문하기')}
<div style="height:40px"></div>
</div>`;
}
