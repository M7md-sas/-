/**
 * ================================================
 *  نظام التحديثات — تطبيق مالي
 * ================================================
 *
 *  ✅ كيف تضيف تحديث جديد؟
 *     أضف object جديد في نهاية مصفوفة UPDATES
 *     غيّر version فقط وأضف المحتوى — النظام يتكفل بالباقي
 *
 *  📌 حقول كل تحديث:
 *     version   : رقم فريد مثل 'v1.3' — لا تكرره أبداً
 *     icon      : إيموجي يمثل التحديث
 *     iconBg    : لون خلفية الأيقونة  rgba(...)
 *     iconBorder: لون حدود الأيقونة  rgba(...)
 *     title     : عنوان التحديث
 *     subtitle  : وصف مختصر (سطر أو سطرين)
 *     features  : مصفوفة المميزات — كل عنصر:
 *       { icon, bg, title, desc }
 *       أو لعنصر فيه pills:
 *       { icon, bg, title, pills: [{text, color, bg}] }
 * ================================================
 */

const UPDATES = [

  // ────────────────────────────────────────────
  // v1.2 — المستشار المالي الذكي
  // ────────────────────────────────────────────
  {
    version  : 'v1.2',
    icon     : '🤖',
    iconBg   : 'rgba(108,99,255,0.1)',
    iconBorder: 'rgba(108,99,255,0.3)',
    title    : 'مستشارك المالي الذكي',
    subtitle : 'أضفنا زر AI في الشريط العلوي\nاضغطه في أي وقت للتحليل الفوري',
    features : [
      {
        icon : '📊',
        bg   : 'rgba(16,185,129,0.12)',
        title: 'درجة الصحة المالية',
        desc : 'تقييم من 0 إلى 100 بناءً على أرقامك الفعلية'
      },
      {
        icon : '🎯',
        bg   : 'rgba(251,191,36,0.12)',
        title: 'تحليل فوري وهدف التوفير',
        desc : 'يحسب نسبة إنفاقك ويقترح كم تخفض يومياً'
      },
      {
        icon : '💡',
        bg   : 'rgba(108,99,255,0.12)',
        title: 'نصائح مالية — 6 تصنيفات',
        pills: [
          { text:'💡 مهمة',          color:'#38bdf8', bg:'rgba(56,189,248,0.15)'  },
          { text:'🛠️ من الواقع',    color:'#10b981', bg:'rgba(16,185,129,0.15)'  },
          { text:'🛑 خلك واعي',      color:'#f87171', bg:'rgba(248,113,113,0.15)' },
          { text:'🎓 الذكاء المالي', color:'#a78bfa', bg:'rgba(167,139,250,0.15)' },
          { text:'📈 شغّل مالك',    color:'#fbbf24', bg:'rgba(251,191,36,0.15)'  },
          { text:'🎲 فاجئني',        color:'#6c63ff', bg:'rgba(108,99,255,0.15)'  },
        ]
      },
      {
        icon : '⚡',
        bg   : 'rgba(45,212,191,0.12)',
        title: 'يعمل بدون إنترنت',
        desc : 'كل التحليلات محلية على جهازك'
      },
    ]
  },

  // ────────────────────────────────────────────
  // أضف تحديثك القادم هنا ↓
  // ────────────────────────────────────────────
  /*
  {
    version  : 'v1.3',
    icon     : '📊',
    iconBg   : 'rgba(16,185,129,0.1)',
    iconBorder: 'rgba(16,185,129,0.3)',
    title    : 'اسم الميزة الجديدة',
    subtitle : 'وصف مختصر\nسطر ثاني اختياري',
    features : [
      {
        icon : '✨',
        bg   : 'rgba(251,191,36,0.12)',
        title: 'اسم الميزة',
        desc : 'وصف الميزة'
      },
    ]
  },
  */

];

// ════════════════════════════════════════════
//  محرك العرض — لا تعدّل هنا
// ════════════════════════════════════════════
(function () {

  // أحدث تحديث هو آخر عنصر في المصفوفة
  const update = UPDATES[UPDATES.length - 1];
  if (!update) return;

  const KEY     = 'mali_update_seen_' + update.version;
  const DISMISS = 'mali_update_hide_'  + update.version;

  // إذا أغلقه نهائياً — لا تعرضه
  if (localStorage.getItem(DISMISS) === '1') return;

  // ── بناء HTML المميزات ──
  const featuresHTML = update.features.map(f => {
    const content = f.pills
      ? `<div style="font-size:0.82rem;font-weight:700;margin-bottom:6px;">${f.title}</div>
         <div style="display:flex;flex-wrap:wrap;gap:5px;">
           ${f.pills.map(p => `
             <span style="font-size:0.62rem;font-weight:600;padding:2px 8px;
               border-radius:99px;background:${p.bg};color:${p.color};">${p.text}</span>
           `).join('')}
         </div>`
      : `<div style="font-size:0.82rem;font-weight:700;margin-bottom:2px;">${f.title}</div>
         <div style="font-size:0.72rem;color:#7b7f94;line-height:1.5;">${f.desc}</div>`;

    return `
      <div style="display:flex;align-items:flex-start;gap:10px;">
        <div style="
          width:30px;height:30px;border-radius:8px;
          background:${f.bg};
          display:flex;align-items:center;justify-content:center;
          font-size:0.9rem;flex-shrink:0;margin-top:1px;
        ">${f.icon}</div>
        <div style="flex:1;">${content}</div>
      </div>`;
  }).join('');

  // ── بناء النافذة ──
  const overlay = document.createElement('div');
  overlay.id = 'upd-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;
    background:rgba(0,0,0,0.65);
    backdrop-filter:blur(6px);
    z-index:99998;
    display:flex;
    align-items:flex-end;
  `;

  overlay.innerHTML = `
    <style>
      @keyframes updSlide {
        from{transform:translateY(100%);opacity:0}
        to{transform:translateY(0);opacity:1}
      }
    </style>

    <div id="upd-sheet" onclick="event.stopPropagation()" style="
      background:#1a1d27;
      border-radius:22px 22px 0 0;
      width:100%;
      padding:20px 18px 28px;
      padding-bottom:calc(28px + env(safe-area-inset-bottom));
      animation:updSlide 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
      box-shadow:0 -8px 40px rgba(0,0,0,0.6);
      max-height:90vh;
      overflow-y:auto;
    ">
      <!-- مقبض -->
      <div style="width:38px;height:4px;background:rgba(255,255,255,0.07);border-radius:99px;margin:0 auto 18px;"></div>

      <!-- شارة النسخة -->
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:12px;">
        <span style="
          background:linear-gradient(135deg,#10b981,#059669);
          color:#fff;font-size:0.65rem;font-weight:700;
          padding:3px 10px;border-radius:99px;letter-spacing:0.5px;
        ">✦ تحديث جديد</span>
        <span style="
          background:rgba(255,255,255,0.07);
          color:#7b7f94;font-size:0.65rem;font-weight:700;
          padding:3px 9px;border-radius:99px;
        ">${update.version}</span>
      </div>

      <!-- أيقونة + عنوان -->
      <div style="display:flex;align-items:center;gap:13px;margin-bottom:14px;">
        <div style="
          width:52px;height:52px;
          background:${update.iconBg};
          border:1px solid ${update.iconBorder};
          border-radius:14px;
          display:flex;align-items:center;justify-content:center;
          font-size:1.7rem;flex-shrink:0;
        ">${update.icon}</div>
        <div>
          <div style="font-size:0.95rem;font-weight:700;margin-bottom:3px;">${update.title}</div>
          <div style="font-size:0.72rem;color:#7b7f94;line-height:1.5;">
            ${update.subtitle.replace(/\n/g,'<br>')}
          </div>
        </div>
      </div>

      <!-- فاصل -->
      <div style="height:1px;background:rgba(255,255,255,0.07);margin:14px 0;"></div>

      <!-- المميزات -->
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
        ${featuresHTML}
      </div>

      <!-- خانة عدم الإظهار -->
      <div id="upd-noshow-row" onclick="updToggle()" style="
        display:flex;align-items:center;gap:10px;
        padding:11px 13px;
        background:#22263a;
        border-radius:11px;
        margin-bottom:14px;
        cursor:pointer;
        border:1px solid rgba(255,255,255,0.07);
        transition:border-color 0.2s;
      ">
        <div id="upd-cb" style="
          width:19px;height:19px;
          border:1.5px solid #7b7f94;
          border-radius:5px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          transition:all 0.2s;font-size:0.75rem;color:#fff;
        "></div>
        <div style="font-size:0.78rem;color:#7b7f94;">لا تظهر هذه الرسالة مرة ثانية</div>
      </div>

      <!-- زر فهمت -->
      <button onclick="updClose(true)" style="
        width:100%;padding:13px;
        background:linear-gradient(135deg,#10b981,#059669);
        color:#fff;border:none;border-radius:13px;
        font-family:var(--font,inherit);font-size:0.92rem;font-weight:700;
        cursor:pointer;letter-spacing:0.3px;
      ">فهمت</button>

    </div>
  `;

  // ── الضغط خارج = نفس فهمت بدون خانة ──
  overlay.addEventListener('click', () => updClose(false));

  document.body.appendChild(overlay);

  // ── تبديل الخانة ──
  let _noShow = false;
  window.updToggle = function () {
    _noShow = !_noShow;
    const cb  = document.getElementById('upd-cb');
    const row = document.getElementById('upd-noshow-row');
    cb.textContent        = _noShow ? '✓' : '';
    cb.style.background   = _noShow ? '#10b981' : 'transparent';
    cb.style.borderColor  = _noShow ? '#10b981' : '#7b7f94';
    row.style.borderColor = _noShow ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.07)';
  };

  // ── الإغلاق ──
  window.updClose = function (fromBtn) {
    if (fromBtn && _noShow) {
      localStorage.setItem(DISMISS, '1');
    }
    const el = document.getElementById('upd-overlay');
    if (!el) return;
    el.style.transition = 'opacity 0.25s';
    el.style.opacity    = '0';
    setTimeout(() => el.remove(), 260);
  };

})();
