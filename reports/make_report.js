const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, HeadingLevel, LevelFormat, BorderStyle, Footer,
  Header, PageNumber, PageBreak, TableOfContents, ExternalHyperlink,
} = require("docx");

const FONT = "Malgun Gothic";
const NAVY = "1F3A5F", GOLD = "B77A00", LIGHT = "E8EEF4", GREY = "5A666E", WARN = "FBE6DC";
const PAGE_W = 11906, MARGIN = 1134, CONTENT_W = PAGE_W - MARGIN * 2; // A4, 2cm margins

// ---------- helpers ----------
const run = (text, o = {}) => new TextRun({ text, font: FONT, ...o });
const p = (text, o = {}) => new Paragraph({
  spacing: { after: 120, line: 300 }, ...o,
  children: Array.isArray(text) ? text : [run(text)],
});
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(t)] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(t)] });
const bullet = (parts, level = 0) => new Paragraph({
  numbering: { reference: "bullets", level }, spacing: { after: 60, line: 290 },
  children: (Array.isArray(parts) ? parts : [parts]).map(x => typeof x === "string" ? run(x) : x),
});
const num = (parts) => new Paragraph({
  numbering: { reference: "nums", level: 0 }, spacing: { after: 60, line: 290 },
  children: (Array.isArray(parts) ? parts : [parts]).map(x => typeof x === "string" ? run(x) : x),
});
const b = (t) => run(t, { bold: true });
const link = (text, url) => new ExternalHyperlink({ link: url, children: [run(text, { style: "Hyperlink", size: 18 })] });
const note = (text) => new Paragraph({
  spacing: { before: 60, after: 160, line: 280 },
  shading: { type: ShadingType.CLEAR, fill: WARN, color: "auto" },
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: "9A3B12", space: 6 } },
  indent: { left: 120, right: 120 },
  children: (Array.isArray(text) ? text : [text]).map(x => typeof x === "string" ? run(x, { size: 19 }) : x),
});

const border = { style: BorderStyle.SINGLE, size: 4, color: "C9D2DA" };
const borders = { top: border, bottom: border, left: border, right: border };

function table(header, rows, weights, opts = {}) {
  const total = weights.reduce((a, c) => a + c, 0);
  const widths = weights.map(w => Math.floor(CONTENT_W * w / total));
  widths[widths.length - 1] += CONTENT_W - widths.reduce((a, c) => a + c, 0);
  const cell = (content, i, isHead, rowIdx) => new TableCell({
    borders, width: { size: widths[i], type: WidthType.DXA },
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    shading: isHead ? { type: ShadingType.CLEAR, fill: NAVY, color: "auto" }
      : (rowIdx % 2 === 1 ? { type: ShadingType.CLEAR, fill: "F5F7F9", color: "auto" } : undefined),
    children: String(content).split("\n").map(line => new Paragraph({
      spacing: { after: 20, line: 264 },
      children: [run(line, { size: 18, bold: isHead || (opts.boldFirst && i === 0), color: isHead ? "FFFFFF" : undefined })],
    })),
  });
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: header.map((h, i) => cell(h, i, true, 0)) }),
      ...rows.map((r, ri) => new TableRow({ children: r.map((c, i) => cell(c, i, false, ri)) })),
    ],
  });
}
const gap = () => new Paragraph({ spacing: { after: 80 }, children: [] });

// ---------- content ----------
const cover = [
  new Paragraph({ spacing: { before: 2600, after: 200 }, children: [run("사업 검토 보고서", { size: 24, color: GOLD, bold: true })] }),
  new Paragraph({ spacing: { after: 200 }, children: [run("산란계 병아리 부화 및 중추 육성 사업", { size: 44, bold: true, color: NAVY })] }),
  new Paragraph({ spacing: { after: 600 }, children: [run("설비 구성 · 제조사 비교 · 암수 감별 · 사료 소요량", { size: 26, color: GREY })] }),
  new Paragraph({
    border: { top: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 8 } }, spacing: { after: 80 },
    children: [run("부화 규모: 1회 병아리 약 40,000마리  |  육성 규모: 중추 100,000마리 이상", { size: 20 })],
  }),
  new Paragraph({ children: [run("작성일: 2026년 9월 27일", { size: 20, color: GREY })] }),
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ spacing: { after: 200 }, children: [run("목차", { size: 32, bold: true, color: NAVY })] }),
  new TableOfContents("목차", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ children: [new PageBreak()] }),
];

const summary = [
  h1("요약"),
  p("이 보고서는 산란계 병아리를 부화해 산란 직전(16~17주령)까지 키우는 사업에 필요한 설비, 제조사, 투자 규모, 운영 원칙을 정리한 검토 자료입니다."),
  table(["핵심 항목", "검토 결과"], [
    ["부화 설비", "싱글스테이지 방식 권장. 매주 종란 약 47,000개 입란 기준으로 입란기 약 57,600개급 3대 + 발생기 2대 교대 운영"],
    ["육성 설비", "동당 3만~4만 수 × 3~4개 동, 올인올아웃. H형 다단 육추·육성 겸용 케이지 또는 에이비어리(동물복지형)"],
    ["암수 감별", "부화 당일 감별 필수(깃털 감별·깃털색 감별·항문 감별). 키워서 육안으로 구별하면 8주에 수당 약 1.7~2.0kg 사료가 낭비됨"],
    ["투자 규모(설비만)", "유럽산 부화장 약 15억~30억 원 / 중국산 약 3억~6억 원\n중국산 H형 케이지 10만 수 약 1.8억~3.2억 원 / 유럽산 약 5.6억~11억 원"],
    ["핵심 리스크", "종란 수급, 수평아리 처리, AI(조류인플루엔자) 방역, 정전 대비, 중국산 장비의 A/S"],
  ], [1, 3], { boldFirst: true }),
  note("가격 중 일부만 공개 자료로 확인한 값이며, 나머지는 공개 정가가 없어 업계 관행으로 잡은 추정치입니다. 표마다 [출처]와 [추정]으로 구분했습니다. 실제 투자 결정 전에 반드시 견적을 받으세요."),
];

const premise = [
  h1("1. 사업 전제와 선결 과제"),
  h2("1.1 암수 감별이 규모 계산의 출발점"),
  p("산란계는 부화한 병아리의 약 50%가 수평아리라 산란용으로 쓸 수 없습니다. 따라서 ‘4만 마리 부화’는 곧 ‘암평아리 약 2만 마리’를 뜻합니다."),
  table(["목표", "필요 입란 수(부화율 85%)", "암평아리"], [
    ["병아리 4만 마리 부화", "약 47,000개", "약 20,000마리"],
    ["암평아리 4만 마리 확보", "약 95,000개", "약 40,000마리"],
  ], [2, 2, 1.5]),
  gap(),
  h2("1.2 종란 수급"),
  bullet("종계장을 직접 운영하거나 종계 농장과 장기 공급 계약을 맺어야 합니다."),
  bullet("하이라인, 로만, 하이섹스 등 품종 라이선스와 감별 방식(깃털·깃털색)을 계약 단계에서 확인합니다."),
  h2("1.3 인허가(국내)"),
  bullet("축산법상 부화업과 가축사육업 허가·등록"),
  bullet("가축전염병예방법상 방역시설 기준(소독시설, 울타리, 전실 등)"),
  bullet("사육 밀도 기준과 AI 특별방역 규정은 자주 개정되므로 착공 전 관할 시·군 축산과에서 최신 기준 확인"),
  h2("1.4 부화장과 육성장 분리"),
  p("방역 원칙상 가능하면 부지를 따로 둡니다. 같은 부지라면 최대한 떨어뜨리고 차량과 인력 동선을 완전히 분리합니다."),
];

const hatchery = [
  h1("2. 부화 설비 (1회 병아리 4만 마리)"),
  h2("2.1 생산 계산"),
  table(["항목", "수치"], [
    ["부화 기간", "21일 (입란기 18일 + 발생기 3일)"],
    ["필요 종란", "40,000 ÷ 0.85 ≈ 47,000개 / 회"],
    ["매주 부화 시 입란기 용량", "3회차 동시 수용 → 약 140,000~150,000개"],
    ["발생기", "1회차분(약 47,000~50,000개) + 세척 여유 → 2대 교대 운영"],
  ], [1.3, 3], { boldFirst: true }),
  gap(),
  h2("2.2 부화기 방식"),
  table(["방식", "특징", "권장"], [
    ["싱글스테이지\n(한 회차씩 넣고 빼는 방식)", "배아 성장에 맞춰 온도·습도·CO₂ 정밀 제어, 부화율 높음, 회차마다 세척·소독 가능", "신규 사업 권장"],
    ["멀티스테이지\n(여러 회차 혼합)", "가격이 싸고 운영이 단순하지만 방역·부화율 면에서 불리", "소규모·저예산"],
  ], [1.4, 3, 1], { boldFirst: true }),
  gap(),
  h2("2.3 부화장 내부 동선 (한 방향 흐름)"),
  num("종란 입고 → 훈증·소독실 → 선별실"),
  num("종란 저장실(15~18℃, 습도 75~80%) → 예열실"),
  num("입란실(Setter) 18일 → 18일째 검란·이란"),
  num("발생실(Hatcher) 3일"),
  num("병아리 처리실: 암수 감별, 마렉 백신 주사·분무 백신, 적외선 부리 다듬기"),
  num("출하 대기실(24~26℃) → 출하"),
  p([run("세척실, 기구 소독실, 폐기물(부화찌꺼기) 처리실은 별도 동선으로 둡니다.", { color: GREY })]),
  h2("2.4 부대 설비"),
  bullet([b("공조(HVAC): "), run("실별 양압·음압 관리, 온습도 제어, 입란실 CO₂ 관리")]),
  bullet([b("냉난방: "), run("보일러와 칠러(부화 후반 배아 발열로 냉각수 필요)")]),
  bullet([b("비상 발전기: "), run("필수. 정전 몇 시간이면 한 회차 전체를 잃을 수 있음")]),
  bullet([b("기타: "), run("정수·연수 설비, 자동 이란기, 검란기, 병아리 카운터, 박스 적재기, 원격 알람")]),
  bullet([b("부화장 규모: "), run("대략 800~1,200㎡ (업체 설계로 확정)")]),
];

const rearing = [
  h1("3. 중추 육성 설비 (10만 마리 이상)"),
  h2("3.1 사육 주기와 규모"),
  bullet("사육 기간: 0~16/17주령, 이후 산란계사로 이동하거나 중추로 판매"),
  bullet("올인올아웃 1주기: 17주 사육 + 2~3주 청소·소독 ≈ 20주"),
  bullet("4만 수 회차를 6~7주 간격으로 입추하면 3개 동이 동시에 운영되어 최대 약 12만 수"),
  bullet([b("권장 구성: "), run("동당 3만~4만 수 × 3~4개 동, 동별 입추 시기를 엇갈려 운영")]),
  h2("3.2 케이지 시스템"),
  table(["구분", "내용"], [
    ["H형 다단 육추·육성 겸용 케이지", "3~8단. 1일령부터 옮기지 않고 한 케이지에서 사육. 층마다 분뇨 벨트"],
    ["에이비어리 육성 시스템", "케이지 없이 다단 구조물을 오르내리며 사육. 동물복지형 산란계사로 보낼 중추에 필수"],
    ["사육 밀도(참고)", "0~6주 약 100~150㎠/수, 6~17주 약 250~310㎠/수 (품종 매뉴얼과 국내 법적 기준 확인)"],
    ["건물 규모(예시)", "동당 3만~4만 수 기준 폭 약 14~16m × 길이 약 90~110m (단 수에 따라 다름)"],
  ], [1.3, 3], { boldFirst: true }),
  gap(),
  h2("3.3 계사 자동화 설비"),
  table(["설비", "요점"], [
    ["자동 급이", "외부 사일로 → 오거 → 급이 호퍼 또는 체인. 주령별 사료 전환"],
    ["자동 급수", "높이 조절형 니플(육추용 컵 니플), 약품·백신 투여기"],
    ["분뇨 처리", "분뇨 벨트로 매일 배출, 건조장·퇴비화 시설 연계"],
    ["환기", "터널 환기 + 측벽 입기구, 대형 배기팬, 여름철 쿨링패드"],
    ["난방", "육추 초기 32~35℃. 온풍기 또는 온수 라디에이터, 바닥 단열"],
    ["조명", "LED 조광(디밍). 육성기 점등 프로그램이 산란 시작과 성적을 좌우"],
    ["환경 제어기", "온도·습도·CO₂·암모니아·부압 자동 제어, 원격 모니터링, 정전·고온 알람"],
    ["기타", "비상 발전기, 자동 체중계, 폐사체 처리기"],
  ], [1, 3], { boldFirst: true }),
  gap(),
  h2("3.4 농장 방역 구성"),
  bullet("외곽 울타리, 차량 소독조·소독기, 대인 소독실(샤워 인·아웃), 동별 전실"),
  bullet("방조망과 쥐 차단, 사료 차량은 외부에서 사일로에 공급하는 구조"),
];

const flow = [
  h1("4. 전체 운영 흐름"),
  num("종란 수급: 약 47,000개 / 주"),
  num("부화장 21일 → 병아리 약 40,000마리 / 주"),
  num("부화 당일 감별 → 암평아리 약 20,000마리 / 주"),
  num("육성장: 6~7주 간격으로 동당 약 40,000마리 입추(2~3주분 암평아리)"),
  num("16~17주 후 중추 출하 또는 자체 산란계사로 이동"),
  note("매주 4만 마리를 부화하면 암평아리만 1년에 약 100만 마리가 나와 육성장 10만 마리 규모보다 훨씬 많습니다. 남는 병아리는 초생추(갓 부화한 병아리)로 다른 농가에 판매하는 구조가 되어야 수지가 맞습니다."),
];

const makers = [
  h1("5. 제조사 비교"),
  h2("5.1 대형 부화기 · 유럽·북미"),
  table(["제조사", "국가", "대표 모델", "용량(입란기)", "특징"], [
    ["Petersime", "벨기에", "BioStreamer / HD, X-Streamer HD", "19,200~115,200개", "배아 반응형 부화, HD는 같은 면적에 12% 더 입란, 공식 인증 중고"],
    ["Royal Pas Reform", "네덜란드", "SmartSetPro, SmartSense, SmartHatch", "최대 115,200개", "대용량 싱글스테이지, 부화장 턴키"],
    ["HatchTech", "네덜란드", "MicroClimer 150·88 시리즈", "대차 7,000~26,000개", "균일한 미세기류, 발생기 내 급이·급수"],
    ["Chick Master", "미국·영국", "Avida Setter/Hatcher", "10,000~133,000개", "북미 계열사 다수 사용"],
    ["Jamesway", "캐나다", "Platinum 2.0 (P10~P120)", "10,000~129,024개", "모델 폭이 넓음"],
  ], [1.2, 0.8, 1.6, 1.2, 2]),
  gap(),
  h2("5.2 대형 부화기 · 중국"),
  table(["제조사", "대표 모델", "용량", "비고"], [
    ["Beijing Yunfeng(云峰)", "YFDF-57600 등", "20,000~57,600개+", "중국 최초 전자식 부화기 제조사, 1950년대부터 생산"],
    ["Sinopfe(Elite)", "ELT-57600S Setter", "57,600개", "9.6kW, 4.5×3.8×2.7m, 대차식"],
    ["Dezhou Weiqian(伟乾)", "캐비닛형", "수백~수만 개", "중·소형 위주, 시험 부화·보조용"],
  ], [1.5, 1.3, 1.2, 2.5]),
  gap(),
  h2("5.3 H형 다단 육추·육성 겸용 케이지"),
  table(["제조사", "국가", "모델", "특징"], [
    ["Big Dutchman", "독일", "UNIVENT Starter / 680-plus", "육추 단·육성 단 구분, 분뇨 벨트 송풍 옵션"],
    ["Salmet", "독일", "S1000 · S1400 · S700", "급이구 폭 조절 슬라이딩 게이트, S1400 칸 1400×750×660mm"],
    ["Valli", "이탈리아", "Pullet rearing cage", "에어덕트 옵션, 케이지↔에이비어리 전환형"],
    ["Facco", "이탈리아", "Rearing housing(C3 등)", "다단 육성 케이지 + 케이지프리 육성"],
    ["Tecno", "이탈리아", "Pullets rearing", "급이·급수·환기 통합 제어"],
    ["LIVI", "중국", "H-Type Pullet Battery Cage", "0~7주 육추부터, 2만 5천 수 이상 무창 계사용"],
    ["RETECH", "중국", "H Type Pullet Cage", "용융아연도금 3·4단"],
    ["Big Herdsman(大牧人)", "중국", "Pullet Cage System", "3~8단, IoT·환경제어 통합, 중국 상위권"],
  ], [1.3, 0.8, 1.6, 2.6]),
  gap(),
  h2("5.4 에이비어리 육성 시스템"),
  table(["제조사", "국가", "모델", "특징"], [
    ["Big Dutchman", "독일", "NATURA Primus(3단) · Filia(2단)", "산란 에이비어리로 자연스러운 전환"],
    ["Vencomatic", "네덜란드", "Bolegg Starter", "발달 단계별 조정, Bolegg Gallery·Terrace와 연계"],
    ["Facco", "이탈리아", "Libera Pullets", "운동 능력 발달 중심 설계"],
    ["Valli", "이탈리아", "육성 에이비어리 · 전환형", "규제 불확실 시 선택지"],
    ["Gofee / Hightop / FamTECH", "중국", "Pullet & Production Aviary", "자동 급이·급수·분뇨벨트 조합"],
  ], [1.4, 0.8, 1.8, 2.3]),
];

const prices = [
  h1("6. 가격대와 투자 규모"),
  p("기준: 매주 병아리 4만 마리 부화(입란기 57,600개급 3대 + 발생기 2대), 중추 10만 수 육성. 설비 본체만의 대략적인 범위이며 건물, 부지, 전기 인입, 인허가 비용은 제외했습니다. 환율은 1달러 약 1,400원, 1유로 약 1,550원으로 계산했습니다."),
  table(["항목", "유럽·북미산", "중국산", "근거"], [
    ["대형 입란기 1대(57,600개급)", "약 1.5억~2.5억 원", "약 2,800만~4,200만 원", "중국: 판매가 US$20~30k [출처]\n유럽: [추정]"],
    ["부화장 설비 일체", "약 15억~30억 원", "약 3억~6억 원", "[추정]"],
    ["H형 육성 케이지 10만 수", "약 5.6억~11억 원", "약 1.8억~3.2억 원", "중국: 2만 수 US$25~45k EXW [출처]"],
    ["에이비어리 육성 10만 수", "약 8억~20억 원", "약 3억~6억 원", "[추정]"],
    ["계사 환경제어(동당)", "약 1억~3억 원", "약 3천만~8천만 원", "[추정]"],
    ["수입 부대비용", "장비가의 약 15~30%", "장비가의 약 15~30%", "운송·관세·통관·설치 [추정]"],
  ], [1.7, 1.4, 1.4, 1.8], { boldFirst: true }),
  gap(),
  h2("6.1 견적 받을 때 확인할 것"),
  bullet([b("부화기: "), run("보증 부화율, 국내 설치 실적과 A/S 인력, 부품 재고 위치, 원격 모니터링, 정격 전력")]),
  bullet([b("케이지: "), run("아연도금 두께(g/㎡), 수당 면적(㎠)과 급이구 길이, 단 수, 분뇨 벨트 재질, 국내 밀도 기준 충족")]),
  bullet([b("공통: "), run("EXW/FOB/CIF 조건, 설치·시운전 포함 여부, 380V 3상 60Hz 대응")]),
  bullet("Big Dutchman, Petersime 등의 한국 대리점 견적과 해외 직수입 견적을 함께 비교"),
];

const sexing = [
  h1("7. 암수 감별과 사료 소요량"),
  h2("7.1 감별 방법과 시기"),
  p("상업용 산란계 부화장은 병아리를 키워서 암수를 가리지 않고, 부화 당일에 감별해 암평아리만 육추사로 보냅니다."),
  table(["방법", "가능 시기", "정확도", "비고"], [
    ["깃털 감별", "부화 당일", "약 95~99%", "화이트 계열(하이라인 W-36, 로만 LSL 등)"],
    ["깃털색 감별", "부화 당일", "약 98~99%", "브라운 계열. 암컷 갈색·적갈색, 수컷 흰색·노란색"],
    ["항문 감별", "부화 당일", "약 95~98%", "전문 감별사 필요, 모든 품종 가능"],
    ["알 속 감별", "입란 9~13일째", "약 95% 이상", "독일·프랑스 도입, 국내는 초기 단계"],
    ["육안(볏·체형)", "5~6주 추정, 8~12주 확실", "주령에 따라 상승", "상업용으로 쓰지 않음"],
  ], [1.2, 1.3, 1, 2.5], { boldFirst: true }),
  gap(),
  h2("7.2 주령별 사료 섭취량 (1마리 기준)"),
  table(["주령", "1일 섭취량(g)", "해당 주 합계(kg)", "누적(kg)", "비고"], [
    ["1주", "약 14", "0.10", "0.10", ""],
    ["2주", "약 19", "0.13", "0.23", ""],
    ["3주", "약 24", "0.17", "0.40", ""],
    ["4주", "약 28", "0.20", "0.60", ""],
    ["5주", "약 35", "0.25", "0.85", ""],
    ["6주", "약 39", "0.27", "1.12", "육안 추정 시작"],
    ["7주", "약 42", "0.29", "1.41", ""],
    ["8주", "약 46", "0.32", "1.73", "육안 감별 비교적 확실"],
    ["10주", "약 55", "0.38", "약 2.5", ""],
    ["12주", "약 62", "0.43", "약 3.4", ""],
    ["17주", "약 75~80", "약 0.54", "약 5.5~6.0", "산란계사 이동"],
  ], [0.8, 1.1, 1.1, 1, 1.6]),
  p([run("하이라인 브라운 등 대표 품종 사양 관리 지침 기준의 대략값입니다. 수평아리는 8주까지 누적 약 1.9~2.0kg으로 조금 더 먹습니다.", { size: 18, color: GREY })], { spacing: { before: 80, after: 160 } }),
  h2("7.3 감별 시점에 따른 사료 손실 (4만 마리 부화 1회 기준)"),
  table(["감별 시점", "수평아리 2만 마리 사료", "사료비(kg당 약 700원)"], [
    ["부화 당일", "0 kg", "0원"],
    ["6주 후 육안 감별", "약 22~24톤", "약 1,600만 원"],
    ["8주 후 육안 감별", "약 38~40톤", "약 2,700만 원"],
  ], [1.5, 1.7, 1.7], { boldFirst: true }),
  note("매주 부화하면 1년에 수억 원이 수평아리 사료로 나갑니다. 케이지 공간, 난방비, 백신비, 인건비도 따로 듭니다."),
];

const next = [
  h1("8. 권장 운영 방식과 다음 단계"),
  h2("8.1 권장 운영 방식"),
  num([b("감별이 쉬운 품종의 종란 확보: "), run("깃털 감별 또는 깃털색 감별 품종인지 계약 시 확인")]),
  num([b("부화장에 감별 라인 설치: "), run("발생기 → 감별대 → 암평아리만 백신 접종 후 육추사로")]),
  num([b("수평아리 처리 경로 사전 확보: "), run("국내 동물보호 규정에 맞는 처리 방법을 인허가 단계에서 함께 확인")]),
  num([b("알 속 감별 장기 검토: "), run("유럽식 병아리 도태 규제 도입 가능성에 대비")]),
  h2("8.2 결정이 필요한 사항"),
  table(["항목", "선택지"], [
    ["사업 모델", "초생추 판매 중심 / 중추 판매 / 자체 산란까지"],
    ["부화 주기", "매주 / 격주 / 월 1회 (부화기 대수 결정)"],
    ["육성 방식", "H형 케이지 / 에이비어리(동물복지형)"],
    ["부지", "부화장·육성장 분리 가능 여부, 3상 대용량 전력, 지하수"],
    ["견적", "부화기 2~3곳, 케이지 2~3곳에 설계 포함 턴키 견적 요청"],
  ], [1, 3], { boldFirst: true }),
];

const refs = [
  h1("부록. 참고 자료"),
  ...[
    ["Petersime BioStreamer HD", "https://www.petersime.com/en/products/incubators/s-line-incubators/the-s-line-product-range/biostreamer-high-density/"],
    ["Pas Reform SmartSetPro", "https://www.pasreform.com/en/solutions/2/incubation/12/smartsetprotm-setter"],
    ["HatchTech MicroClimer", "https://hatchtech.com/our_solutions/hatchtech_microclimer_setters"],
    ["Chick Master Avida", "https://www.agriexpo.online/prod/chickmaster/product-176872-65547.html"],
    ["Jamesway Single-Stage", "https://jamesway.com/products/single-stage/"],
    ["Beijing Yunfeng", "https://www.eggincubator.com/"],
    ["Sinopfe 57600 Setter", "https://www.sinopfe.com/sale-13987730-advanced-57600pcs-single-stage-incubator-poultry-hatchery-machine.html"],
    ["Big Dutchman UNIVENT Starter", "https://www.bigdutchman.com/en/egg-production/products/detail/univent-starter/"],
    ["Big Dutchman NATURA Primus", "https://www.bigdutchmanusa.com/egg-production/products/housing-systems/cage-free-aviary-systems/natura-primus/"],
    ["Salmet S1400", "https://salmet.com/product/s1400-cage-rearing-system/"],
    ["Valli Pullets", "https://www.valli-italy.com/en/category-products/pullets/"],
    ["Facco Rearing", "https://www.facco.net/en/prodotti/pulcinaia"],
    ["Vencomatic Cage-free", "https://www.vencomaticgroup.com/cage-free-detail"],
    ["LIVI 20,000 pullet cage cost", "https://www.livipoultryequipment.com/cost-of-20000-pullet-cage-system-h-type-pullet-equipment/"],
    ["RETECH H-type pullet cage", "https://www.retechchickencage.com/retech-automatic-h-type-poultry-farm-pullet-chicken-cage-product/"],
    ["Big Herdsman pullet cage", "https://bigherdsman.com/blogs/pullet-cage-system-for-poultry-farm-chick-rearing-and-future-egg-production/"],
    ["제조사별 사진 카탈로그(웹)", "https://claude.ai/artifact/53LHXUacTYvg7RMLFM97jq"],
  ].map(([t, u]) => bullet([run(t + ": ", { size: 18 }), link(u, u)])),
];

const doc = new Document({
  creator: "사업 검토팀",
  title: "산란계 병아리 부화 및 중추 육성 사업 검토 보고서",
  styles: {
    default: { document: { run: { font: FONT, size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: NAVY, font: FONT },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, color: GOLD, font: FONT },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 440, hanging: 260 } } } }] },
      { reference: "nums", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 440, hanging: 300 } } } }] },
    ],
  },
  features: { updateFields: true },
  sections: [
    {
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
      children: cover,
    },
    {
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [run("산란계 병아리 부화 및 중추 육성 사업 검토 보고서", { size: 16, color: GREY })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: GREY })] })] }) },
      children: [...summary, ...premise, ...hatchery, ...rearing, ...flow, ...makers, ...prices, ...sexing, ...next, ...refs],
    },
  ],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(process.argv[2], buf);
  console.log("written", process.argv[2], buf.length);
});
