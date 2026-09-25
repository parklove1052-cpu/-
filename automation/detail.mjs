// 상세설명 HTML 생성기 — 스마트스토어 상세설명의 "HTML 작성" 탭에 들어갈 HTML을 만듭니다.
// SEO를 위해 이미지뿐 아니라 텍스트 블록(맞춤 항목, 주문 단계, 스펙, 고지)을 반드시 포함합니다.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function buildDetailHtml(p, common, brand) {
  const d = p.detail;
  // 상세 이미지는 스마트스토어 HTML 모드에서 외부 URL만 쓸 수 있습니다(로컬 파일 불가).
  const imgs = (p.images.detailUrls || [])
    .map((u) => `<img src="${esc(u)}" alt="${esc(p.name)}" style="width:100%;display:block">`)
    .join('\n');
  const optionNames = Object.keys(p.options);
  const specRows = Object.entries(d.spec)
    .map(([k, v]) => `<tr><th style="padding:8px;background:#f5f2ee;width:30%">${esc(k)}</th><td style="padding:8px">${esc(v)}</td></tr>`)
    .join('');

  return `<div style="max-width:860px;margin:0 auto;font-family:sans-serif;color:#222;line-height:1.7;text-align:center">
<h2 style="font-size:28px;margin:40px 0 8px">${esc(d.headline)}</h2>
<p style="font-size:17px;color:#555">${esc(d.sub)}</p>
<p style="display:inline-block;margin:16px 0;padding:12px 24px;background:#222;color:#fff;border-radius:30px;font-weight:bold">▼ 지금 옵션에서 내 가방 만들기</p>

<h3 style="margin-top:40px">${esc(brand)} 맞춤 제작 가능 항목</h3>
<p>${optionNames.map(esc).join(' · ')} · ${esc(p.textOption)}</p>

<h3 style="margin-top:40px">주문 방법 3단계</h3>
<p>① 도안(${esc(p.modelName)}) 선택 → ② 옵션에서 색상 선택 · 문구 입력 → ③ 주문 확인 후 ${common.shippingDays}일 이내 제작 · 발송</p>
<p style="color:#8a5a2b;font-weight:bold">사이즈 변경 · 로고 삽입 · 단체 주문은 톡톡으로 문의하세요. 24시간 안에 시안을 보내드립니다.</p>

${imgs}

<h3 style="margin-top:40px">상품 정보</h3>
<table style="width:100%;border-collapse:collapse;text-align:left;font-size:15px">${specRows}
<tr><th style="padding:8px;background:#f5f2ee">원산지</th><td style="padding:8px">${esc(common.origin)} (핸드메이드 맞춤 제작)</td></tr></table>

<h3 style="margin-top:40px">맞춤 제작 상품 안내</h3>
<p style="font-size:14px;color:#666">${esc(common.customNotice)}</p>
<p style="display:inline-block;margin:24px 0 60px;padding:12px 24px;background:#222;color:#fff;border-radius:30px;font-weight:bold">▲ 옵션 선택하고 나만의 가방 주문하기</p>
</div>`;
}
