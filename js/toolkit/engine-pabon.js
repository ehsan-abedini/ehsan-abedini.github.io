// Pabon Lasso Mathematical Core & SVG Renderer
(function initPabonLasso() {
  const bedsInput = document.getElementById('pabon-beds');
  const alosInput = document.getElementById('pabon-alos');
  const dischInput = document.getElementById('pabon-discharges');
  
  const outBeds = document.getElementById('out-beds');
  const outAlos = document.getElementById('out-alos');
  const outDisch = document.getElementById('out-discharges');

  const kpiBor = document.getElementById('kpi-bor');
  const kpiBtr = document.getElementById('kpi-btr');
  const kpiBti = document.getElementById('kpi-bti');
  const zoneBadge = document.getElementById('pabon-zone-badge');
  const insightText = document.getElementById('pabon-policy-insight');
  const svg = document.getElementById('pabon-svg');

  // بنچ‌مارک‌های استاندارد کشوری/مرجع (پیش‌فرض)
  const BENCH_BOR = 70.0; // درصد
  const BENCH_BTR = 35.0; // چرخش سالانه تخت

  function calculateMetrics(beds, alos, discharges) {
    const daysInYear = 365;
    const totalInpatientDays = discharges * alos;
    const availableBedDays = beds * daysInYear;

    // محاسبات پایه
    const bor = (totalInpatientDays / availableBedDays) * 100;
    const btr = discharges / beds;
    const bti = (availableBedDays - totalInpatientDays) / discharges;

    return { bor, btr, bti };
  }

  function getZone(bor, btr) {
    if (bor < BENCH_BOR && btr < BENCH_BTR) {
      return {
        zone: 'Zone I',
        title: 'Zone I: Low Occupancy, Low Turnover',
        policy: 'Overcapacity & redundant beds. Recommended policy: bed reduction, merging wards, or repurposing infrastructure.',
        color: 'var(--color-danger, #ef4444)'
      };
    } else if (bor < BENCH_BOR && btr >= BENCH_BTR) {
      return {
        zone: 'Zone II',
        title: 'Zone II: Low Occupancy, High Turnover',
        policy: 'Excess bed supply or rapid short-stay churn. Policy review: assess appropriateness of admissions vs day-care.',
        color: 'var(--color-warning, #f59e0b)'
      };
    } else if (bor >= BENCH_BOR && btr >= BENCH_BTR) {
      return {
        zone: 'Zone III',
        title: 'Zone III: High Occupancy, High Turnover',
        policy: 'Optimal operational efficiency. Maintain clinical governance to prevent staff burnout or compromised quality.',
        color: 'var(--color-success, #10b981)'
      };
    } else {
      return {
        zone: 'Zone IV',
        title: 'Zone IV: High Occupancy, Low Turnover',
        policy: 'Bottlenecks & prolonged stay. Policy focus: post-acute step-down care, discharge planning, and infection control.',
        color: 'var(--color-info, #6366f1)'
      };
    }
  }

  function renderChart(bor, btr, zoneInfo) {
    // مقیاس‌بندی مختصات در SVG (عرض: 360, ارتفاع: 260)
    // دامنه BOR: 0 تا 100% | دامنه BTR: 0 تا 80
    const margin = { top: 20, right: 20, bottom: 35, left: 45 };
    const width = 360 - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;

    const scaleX = (val) => margin.left + (Math.min(Math.max(val, 0), 100) / 100) * width;
    const scaleY = (val) => margin.top + height - (Math.min(Math.max(val, 0), 80) / 80) * height;

    const cutX = scaleX(BENCH_BOR);
    const cutY = scaleY(BENCH_BTR);

    const ptX = scaleX(bor);
    const ptY = scaleY(btr);

    svg.innerHTML = `
      <!-- نواحی چهارگانه (پس‌زمینه مات و مدرن) -->
      <rect x="${margin.left}" y="${cutY}" width="${cutX - margin.left}" height="${margin.top + height - cutY}" fill="rgba(239, 68, 68, 0.05)" />
      <rect x="${margin.left}" y="${margin.top}" width="${cutX - margin.left}" height="${cutY - margin.top}" fill="rgba(245, 158, 11, 0.05)" />
      <rect x="${cutX}" y="${margin.top}" width="${margin.left + width - cutX}" height="${cutY - margin.top}" fill="rgba(16, 185, 129, 0.07)" />
      <rect x="${cutX}" y="${cutY}" width="${margin.left + width - cutX}" height="${margin.top + height - cutY}" fill="rgba(99, 102, 241, 0.05)" />

      <!-- خطوط مرجع (Thresholds) -->
      <line x1="${cutX}" y1="${margin.top}" x2="${cutX}" y2="${margin.top + height}" stroke="currentColor" stroke-dasharray="3,3" opacity="0.3" />
      <line x1="${margin.left}" y1="${cutY}" x2="${margin.left + width}" y2="${cutY}" stroke="currentColor" stroke-dasharray="3,3" opacity="0.3" />

      <!-- برچسب‌های مرجع -->
      <text x="${cutX + 4}" y="${margin.top + 12}" font-size="9" fill="currentColor" opacity="0.6">Mean BOR (${BENCH_BOR}%)</text>
      <text x="${margin.left + width - 4}" y="${cutY - 5}" font-size="9" text-anchor="end" fill="currentColor" opacity="0.6">Mean BTR (${BENCH_BTR})</text>

      <!-- برچسب زون‌ها در گوشه‌ها -->
      <text x="${margin.left + 8}" y="${margin.top + height - 8}" font-size="10" font-weight="600" fill="currentColor" opacity="0.4">Zone I</text>
      <text x="${margin.left + 8}" y="${margin.top + 16}" font-size="10" font-weight="600" fill="currentColor" opacity="0.4">Zone II</text>
      <text x="${margin.left + width - 8}" y="${margin.top + 16}" font-size="10" font-weight="600" text-anchor="end" fill="currentColor" opacity="0.4">Zone III</text>
      <text x="${margin.left + width - 8}" y="${margin.top + height - 8}" font-size="10" font-weight="600" text-anchor="end" fill="currentColor" opacity="0.4">Zone IV</text>

      <!-- محورهای X و Y -->
      <line x1="${margin.left}" y1="${margin.top + height}" x2="${margin.left + width}" y2="${margin.top + height}" stroke="currentColor" opacity="0.5" />
      <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + height}" stroke="currentColor" opacity="0.5" />

      <!-- عناوین محورها -->
      <text x="${margin.left + width / 2}" y="${margin.top + height + 28}" font-size="10" text-anchor="middle" fill="currentColor">Bed Occupancy Rate (BOR %)</text>
      <text x="${- (margin.top + height / 2)}" y="16" transform="rotate(-90)" font-size="10" text-anchor="middle" fill="currentColor">Bed Turnover (BTR)</text>

      <!-- نقطه پویا با انیمیشن پالس تعاملی -->
      <circle cx="${ptX}" cy="${ptY}" r="7" fill="${zoneInfo.color}" stroke="#ffffff" stroke-width="2" class="pabon-point" />
    `;
  }

  function update() {
    const beds = parseFloat(bedsInput.value);
    const alos = parseFloat(alosInput.value);
    const discharges = parseFloat(dischInput.value);

    // به‌روزرسانی مقادیر متنی اسلایدرها
    outBeds.textContent = beds.toLocaleString();
    outAlos.textContent = alos.toFixed(1);
    outDisch.textContent = discharges.toLocaleString();

    // محاسبه شاخص‌ها
    const { bor, btr, bti } = calculateMetrics(beds, alos, discharges);

    // به‌روزرسانی کارت‌های KPI
    kpiBor.textContent = `${bor.toFixed(1)}%`;
    kpiBtr.textContent = btr.toFixed(1);
    kpiBti.textContent = `${bti.toFixed(1)} d`;

    // رنگ‌بندی هشدار برای BOR غیرمتعارف بالای ۹۰٪
    kpiBor.style.color = bor > 90 ? 'var(--color-danger, #ef4444)' : 'inherit';

    const zoneInfo = getZone(bor, btr);
    zoneBadge.textContent = zoneInfo.title;
    zoneBadge.style.borderColor = zoneInfo.color;
    zoneBadge.style.color = zoneInfo.color;

    insightText.innerHTML = `<strong>Policy Insight:</strong> ${zoneInfo.policy}`;

    // بازتولید گرافیکی روی SVG
    renderChart(bor, btr, zoneInfo);
  }

  bedsInput.addEventListener('input', update);
  alosInput.addEventListener('input', update);
  dischInput.addEventListener('input', update);

  update(); // اجرای اولیه
})();

