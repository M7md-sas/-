/**
 * 🤖 AI Financial Advisor - Enhanced Version
 * نظام الذكاء الاصطناعي المالي المحسّن
 */

// ====================================
// 1. استخراج البيانات المالية من الصفحة
// ====================================
function getFinancialData() {
  const parseNum = (id) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    const text = el.textContent.replace(/[^0-9.-]/g, '');
    return parseFloat(text) || 0;
  };

  const income    = parseNum('s-salary');
  const expenses  = parseNum('s-spent');
  const commits   = parseNum('s-commits');
  const subs      = parseNum('s-subs');
  const leftEl    = document.getElementById('s-left');
  const leftText  = leftEl ? leftEl.textContent : '';
  const isNeg     = leftEl && leftEl.classList.contains('vr');
  const leftAbs   = parseFloat(leftText.replace(/[^0-9.]/g, '')) || 0;
  const balance   = isNeg ? -leftAbs : leftAbs;

  // إجمالي الإنفاق الفعلي = مصروفات + التزامات + اشتراكات
  const totalSpend = expenses + commits + subs;

  return { income, expenses, commits, subs, totalSpend, balance };
}

// ====================================
// 2. تحليل البيانات وإعطاء نصائح
// ====================================
function analyzeFinances(data) {
  const { income, expenses, commits, subs, totalSpend, balance } = data;
  const insights = [];

  if (income === 0) {
    return {
      score: 0,
      insights: [{ icon: '📊', message: 'أضف دخلك الشهري أولاً' }],
      time: getCurrentTime()
    };
  }

  // حساب النسب المالية بناءً على إجمالي الإنفاق الحقيقي
  const spendingRate = (totalSpend / income) * 100;
  const savingsRate  = Math.max(0, 100 - spendingRate);
  const healthScore  = calculateHealthScore(spendingRate, balance, income);

  // ===== تحليل الإنفاق =====
  if (spendingRate > 100) {
    insights.push({
      icon: '🚨',
      message: `تنفق أكثر من دخلك! (${spendingRate.toFixed(0)}%) - ميزانيتك في خطر`
    });
  } else if (spendingRate > 80) {
    insights.push({
      icon: '🚨',
      message: `تنفق ${spendingRate.toFixed(0)}% من دخلك - قلل المصروفات فوراً`
    });
  } else if (spendingRate > 60) {
    insights.push({
      icon: '⚠️',
      message: `إنفاق مرتفع (${spendingRate.toFixed(0)}%) - استهدف 50%`
    });
  } else if (spendingRate > 40) {
    insights.push({
      icon: '✅',
      message: `إنفاق متوازن (${spendingRate.toFixed(0)}%) - أداء جيد`
    });
  } else {
    insights.push({
      icon: '🌟',
      message: `توفير عالي جداً (${savingsRate.toFixed(0)}%) - ممتاز!`
    });
  }

  // ===== تحليل توزيع الإنفاق =====
  if (income > 0 && commits > 0) {
    const commitPct = (commits / income * 100).toFixed(0);
    if (commits / income > 0.5) {
      insights.push({
        icon: '⚠️',
        message: `التزاماتك ${commitPct}% من دخلك - نسبة مرتفعة جداً`
      });
    } else if (commits / income > 0.3) {
      insights.push({
        icon: '📌',
        message: `التزاماتك ${commitPct}% من دخلك - راجع إمكانية التخفيض`
      });
    }
  }

  // ===== تحليل الرصيد المتبقي =====
  if (balance <= 0) {
    insights.push({
      icon: '🚨',
      message: 'رصيدك سالب أو صفر - قلل المصروفات بسرعة'
    });
  } else if (balance > income) {
    insights.push({
      icon: '🎯',
      message: `مدخرات ممتازة (${balance.toLocaleString('en-US')} ر.س) - استثمر جزء منها`
    });
  } else if (balance > income / 2) {
    insights.push({
      icon: '👍',
      message: `رصيد جيد (${balance.toLocaleString('en-US')} ر.س) - استمر في المدخرات`
    });
  } else if (balance > 0) {
    insights.push({
      icon: '💡',
      message: `متبقي (${balance.toLocaleString('en-US')} ر.س) - حاول توفير أكثر`
    });
  }

  return {
    score: healthScore,
    insights: insights,
    time: getCurrentTime(),
    spendingRate: Math.min(spendingRate, 100).toFixed(0),
    savingsRate: savingsRate.toFixed(0)
  };
}

// ====================================
// 3. حساب درجة الصحة المالية
// ====================================
function calculateHealthScore(spendingRate, balance, income) {
  let score = 50;

  // نسبة الإنفاق الكلي (40 نقطة)
  if (spendingRate <= 50) {
    score += Math.min(40, (50 - spendingRate) * 0.8);
  } else if (spendingRate <= 100) {
    score -= Math.min(40, (spendingRate - 50) * 0.8);
  } else {
    score -= 40; // أكثر من 100% = أسوأ حالة
  }

  // الرصيد المتبقي (10 نقاط)
  if (balance > income) score += 10;
  else if (balance > income * 0.1) score += 5;
  else if (balance <= 0) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ====================================
// 4. الحصول على الوقت الحالي
// ====================================
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

// ====================================
// 5. عرض نافذة التقرير
// ====================================
function showAIReport() {
  // إزالة أي نافذة AI موجودة
  document.querySelectorAll('.ai-overlay').forEach(el => el.remove());

  const data     = getFinancialData();
  const analysis = analyzeFinances(data);
  const scoreColor = getScoreColor(analysis.score);

  // ===== بناء HTML النصائح =====
  const insightsHTML = analysis.insights
    .map(item => `
      <div style="
        background: var(--surface2, #1e2130);
        border-right: 3px solid var(--accent, #6c63ff);
        border-radius: 9px;
        padding: 12px 14px;
        margin-bottom: 10px;
        display: flex;
        gap: 10px;
        align-items: flex-start;
      ">
        <span style="font-size: 1.3rem; flex-shrink: 0;">${item.icon}</span>
        <div style="flex: 1; font-size: 0.87rem; line-height: 1.6;">
          ${item.message}
        </div>
      </div>
    `)
    .join('');

  // ===== توصية الادخار =====
  let savingsSuggestionHTML = '';
  if (data.income > 0 && analysis.score < 80) {
    const idealSave   = Math.round(data.income * 0.2);
    const actualSave  = Math.max(0, data.balance);
    const diff        = idealSave - actualSave;
    if (diff > 0) {
      savingsSuggestionHTML = `
        <div style="
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 13px;
          padding: 15px;
          margin-bottom: 16px;
        ">
          <div style="font-size: 0.75rem; color: #10b981; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">
            🎯 هدف التوفير المقترح
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
            <span style="color: var(--muted,#888)">المستهدف (20%)</span>
            <span style="font-weight: 700; color: #10b981;">${idealSave.toLocaleString('en-US')} ر.س</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 8px;">
            <span style="color: var(--muted,#888)">الفرق المطلوب</span>
            <span style="font-weight: 700; color: #f87171;">↓ ${diff.toLocaleString('en-US')} ر.س</span>
          </div>
          <div style="font-size: 0.78rem; color: var(--muted,#888); line-height: 1.5;">
            💡 قلل مصروفاتك اليومية بـ ${Math.round(diff/30)} ر.س/يوم للوصول للهدف
          </div>
        </div>
      `;
    }
  }

  // ===== ملخص الأرقام =====
  const summaryHTML = data.income > 0 ? `
    <div style="
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-bottom: 16px;
    ">
      <div style="background: var(--surface2,#1e2130); border-radius: 10px; padding: 10px; text-align: center;">
        <div style="font-size: 0.62rem; color: var(--muted,#888); margin-bottom: 4px;">مصروفات</div>
        <div style="font-size: 0.9rem; font-weight: 700; color: #f87171;">${data.expenses.toLocaleString('en-US')}</div>
      </div>
      <div style="background: var(--surface2,#1e2130); border-radius: 10px; padding: 10px; text-align: center;">
        <div style="font-size: 0.62rem; color: var(--muted,#888); margin-bottom: 4px;">التزامات</div>
        <div style="font-size: 0.9rem; font-weight: 700; color: #fbbf24;">${data.commits.toLocaleString('en-US')}</div>
      </div>
      <div style="background: var(--surface2,#1e2130); border-radius: 10px; padding: 10px; text-align: center;">
        <div style="font-size: 0.62rem; color: var(--muted,#888); margin-bottom: 4px;">اشتراكات</div>
        <div style="font-size: 0.9rem; font-weight: 700; color: var(--accent,#6c63ff);">${data.subs.toLocaleString('en-US')}</div>
      </div>
    </div>
  ` : '';

  // ===== الـ Overlay =====
  const overlay = document.createElement('div');
  overlay.className = 'ai-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: flex-end;
    z-index: 99999;
  `;

  overlay.innerHTML = `
    <div style="
      background: var(--surface, #141820);
      border-radius: 22px 22px 0 0;
      width: 100%;
      max-height: 88vh;
      overflow-y: auto;
      padding: 20px 18px;
      padding-bottom: calc(20px + env(safe-area-inset-bottom));
      animation: aiSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow: 0 -8px 40px rgba(0,0,0,0.6);
    ">
      <!-- مقبض السحب -->
      <div style="width:40px; height:4px; background:var(--border,#2a2d3a); border-radius:99px; margin: 0 auto 18px;"></div>

      <!-- العنوان -->
      <div style="text-align:center; margin-bottom:20px;">
        <div style="font-size:2.5rem; margin-bottom:8px; animation: aiPulse 2s infinite;">🤖</div>
        <div style="font-size:1.05rem; font-weight:700; color:var(--text,#fff);">مستشارك المالي الذكي</div>
        <div style="font-size:0.72rem; color:var(--muted,#888); margin-top:3px;">تحليل شهري فوري بدون إنترنت</div>
      </div>

      <!-- درجة الصحة المالية -->
      <div style="
        background: linear-gradient(135deg, ${scoreColor}, ${scoreColor}cc);
        border-radius: 16px;
        padding: 20px;
        text-align:center;
        margin-bottom:16px;
        color:white;
        position:relative;
        overflow:hidden;
      ">
        <div style="font-size:0.8rem; opacity:0.85; margin-bottom:6px;">درجة الصحة المالية</div>
        <div style="font-size:3.2rem; font-weight:800; line-height:1; margin-bottom:14px;">
          ${analysis.score}%
        </div>
        <div style="
          width:100%; height:8px;
          background:rgba(255,255,255,0.2);
          border-radius:99px; overflow:hidden;
          margin-bottom:10px;
        ">
          <div style="
            height:100%;
            background:rgba(255,255,255,0.6);
            width:${analysis.score}%;
            border-radius:99px;
            transition: width 1s ease;
          "></div>
        </div>
        <div style="font-size:0.75rem; opacity:0.9;">
          إنفاق: ${analysis.spendingRate}% | توفير: ${analysis.savingsRate}%
        </div>
        <div style="
          position:absolute; top:-20px; right:-20px;
          width:80px; height:80px;
          background:rgba(255,255,255,0.05);
          border-radius:50%;
        "></div>
      </div>

      <!-- ملخص الأرقام -->
      ${summaryHTML}

      <!-- النصائح -->
      <div style="
        font-size:0.72rem; color:var(--muted,#888);
        font-weight:600; letter-spacing:0.5px;
        margin-bottom:10px;
      ">📋 النصائح والإرشادات</div>
      ${insightsHTML}

      <!-- هدف التوفير -->
      ${savingsSuggestionHTML}

      <!-- آخر تحديث -->
      <div style="
        background:rgba(108,99,255,0.08);
        border: 1px solid rgba(108,99,255,0.2);
        border-radius:10px;
        padding:10px 14px;
        margin-bottom:16px;
        font-size:0.78rem;
        color:var(--muted,#888);
      ">⏰ آخر تحديث: ${analysis.time}</div>

      <!-- الأزرار -->
      <div style="display:flex; gap:10px;">
        <button onclick="this.closest('.ai-overlay').remove()" style="
          flex:1; padding:13px;
          background:var(--accent,#6c63ff); color:white;
          border:0; border-radius:12px;
          font-family:var(--font,inherit); font-size:0.9rem;
          font-weight:700; cursor:pointer;
          transition: transform 0.15s, opacity 0.15s;
          active-transform: scale(0.97);
        " onmousedown="this.style.opacity='0.85'" onmouseup="this.style.opacity='1'">
          فهمت ✓
        </button>
        <button onclick="showNextTip(this)" style="
          flex:1; padding:13px;
          background:var(--surface2,#1e2130); color:var(--accent,#6c63ff);
          border:1px solid var(--border,#2a2d3a);
          border-radius:12px;
          font-family:var(--font,inherit); font-size:0.9rem;
          font-weight:700; cursor:pointer;
          transition: opacity 0.15s;
        " onmousedown="this.style.opacity='0.7'" onmouseup="this.style.opacity='1'">
          نصيحة أخرى 💡
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // إغلاق عند النقر خارج النافذة
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// ====================================
// 6. نصائح مالية داخل النافذة (دوارة)
// ====================================
const ALL_TIPS = [
  { icon: '💡', text: 'سجّل كل مصروفاتك يومياً - الأرقام الصغيرة تتراكم' },
  { icon: '🎯', text: 'اجعل هدفك توفير 20% من دخلك كل شهر' },
  { icon: '💳', text: 'تجنب الشراء الكمالي عند الضغط النفسي أو الملل' },
  { icon: '🏦', text: 'افتح حساب ادخار منفصل وحوّل له تلقائياً أول الشهر' },
  { icon: '📊', text: 'راجع ميزانيتك كل نهاية شهر وتعلم من أخطائك' },
  { icon: '🚫', text: 'ألغِ الاشتراكات التي لم تستخدمها أكثر من شهر' },
  { icon: '💰', text: 'ضع 3 أشهر من مصاريفك كاحتياطي طوارئ' },
  { icon: '📱', text: 'استخدم التطبيق يومياً - المتابعة هي مفتاح النجاح المالي' },
  { icon: '🔄', text: 'قاعدة 24 ساعة: انتظر يوماً قبل أي شراء غير ضروري فوق 100 ر.س' },
  { icon: '📈', text: 'كل ريال تدخره اليوم يساوي أكثر في المستقبل بفضل العائد' },
  { icon: '🍳', text: 'الطبخ في البيت 3 مرات أسبوعياً يوفر أكثر من 300 ر.س شهرياً' },
  { icon: '⛽', text: 'تجميع المشاوير في يوم واحد يقلل مصاريف الوقود بشكل ملحوظ' },
];

let tipIndex = Math.floor(Math.random() * ALL_TIPS.length);

function showNextTip(btn) {
  tipIndex = (tipIndex + 1) % ALL_TIPS.length;
  const tip = ALL_TIPS[tipIndex];

  // ابحث عن منطقة النصائح في النافذة أو أضف نصيحة مؤقتة
  const overlay = btn.closest('.ai-overlay');
  if (!overlay) { showNotification(tip.icon, tip.text, 5000); return; }

  // إضافة النصيحة كبطاقة متحركة قبل الأزرار
  const existing = overlay.querySelector('.extra-tip');
  if (existing) existing.remove();

  const tipCard = document.createElement('div');
  tipCard.className = 'extra-tip';
  tipCard.style.cssText = `
    background: rgba(108,99,255,0.12);
    border: 1px solid rgba(108,99,255,0.3);
    border-radius: 12px;
    padding: 13px 15px;
    margin-bottom: 14px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    animation: aiSlideUp 0.3s ease;
  `;
  tipCard.innerHTML = `
    <span style="font-size:1.3rem; flex-shrink:0;">${tip.icon}</span>
    <div style="flex:1; font-size:0.85rem; line-height:1.6;">${tip.text}</div>
  `;

  const btnRow = overlay.querySelector('div[style*="display:flex; gap:10px"]')
    || overlay.querySelector('button')?.parentElement;
  if (btnRow) {
    btnRow.parentElement.insertBefore(tipCard, btnRow);
  } else {
    overlay.querySelector('div').appendChild(tipCard);
  }

  // اهتزاز خفيف
  tipCard.animate([
    { transform: 'scale(0.95)', opacity: 0 },
    { transform: 'scale(1)',    opacity: 1 }
  ], { duration: 300, easing: 'ease-out' });
}

// للتوافق مع الكود القديم
function showQuickTip() {
  tipIndex = (tipIndex + 1) % ALL_TIPS.length;
  const tip = ALL_TIPS[tipIndex];
  showNotification(tip.icon, tip.text, 5000);
}

// ====================================
// 7. عرض الإشعارات
// ====================================
function showNotification(icon, message, duration = 4000) {
  const container = document.getElementById('ai-notif-container') || createNotificationContainer();

  const notification = document.createElement('div');
  notification.style.cssText = `
    animation: slideIn 0.3s ease;
    background: var(--surface);
    border-right: 4px solid var(--accent);
    border-radius: 11px;
    padding: 12px 14px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.87rem;
    line-height: 1.4;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `;

  notification.innerHTML = `
    <span style="font-size: 1.3rem; flex-shrink: 0;">${icon}</span>
    <span style="flex: 1;">${message}</span>
    <button onclick="this.parentElement.remove()" style="
      background: none;
      border: none;
      color: var(--muted);
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0;
    ">×</button>
  `;

  container.appendChild(notification);

  if (duration) {
    setTimeout(() => {
      if (notification.parentElement) notification.remove();
    }, duration);
  }
}

function createNotificationContainer() {
  const container = document.createElement('div');
  container.id = 'ai-notif-container';
  container.style.cssText = `
    position: fixed;
    top: 60px;
    right: 12px;
    left: 12px;
    max-width: 500px;
    z-index: 4999;
    max-height: 60vh;
    overflow-y: auto;
  `;

  document.body.appendChild(container);
  return container;
}

// ====================================
// 8. تحديد اللون حسب الدرجة
// ====================================
function getScoreColor(score) {
  if (score >= 80) return '#10b981'; // أخضر
  if (score >= 60) return '#fbbf24'; // أصفر
  if (score >= 40) return '#f87171'; // أحمر
  return '#dc2626'; // أحمر غامق
}

// ====================================
// 9. تهيئة النظام
// ====================================
window.addEventListener('load', () => {
  if (!document.getElementById('ai-styles')) {
    const style = document.createElement('style');
    style.id = 'ai-styles';
    style.textContent = `
      @keyframes aiSlideUp {
        from { transform: translateY(60px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to   { transform: translateX(0);     opacity: 1; }
      }
      @keyframes aiPulse {
        0%, 100% { transform: scale(1);    opacity: 1; }
        50%       { transform: scale(1.05); opacity: 0.8; }
      }
      .ai-overlay { animation: none; }
    `;
    document.head.appendChild(style);
  }
  console.log('✅ نظام AI المالي جاهز!');
});

// ====================================
// 10. تعريف الدوال العامة
// ====================================
window.showAI      = showAIReport;
window.showTip     = showQuickTip;
window.showNextTip = showNextTip;
