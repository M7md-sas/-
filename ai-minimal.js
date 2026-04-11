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

      <!-- قسم النصيحة الإضافية -->
      <div style="
        font-size:0.72rem; color:var(--muted,#888);
        font-weight:600; letter-spacing:0.5px;
        margin-bottom:10px;
      ">💡 نصيحة إضافية — اختر التصنيف</div>

      ${buildCatButtonsHTML()}

      <!-- الأزرار الرئيسية -->
      <div class="ai-btn-row" style="display:flex; gap:10px;">
        <button onclick="this.closest('.ai-overlay').remove()" style="
          flex:1; padding:13px;
          background:var(--accent,#6c63ff); color:white;
          border:0; border-radius:12px;
          font-family:var(--font,inherit); font-size:0.9rem;
          font-weight:700; cursor:pointer;
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
        " onmousedown="this.style.opacity='0.7'" onmouseup="this.style.opacity='1'">
          نصيحة 🎲
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
// 6. بنك النصائح المالية الشامل
// ====================================

const TIPS_BANK = {

  // ── نصائح احترافية ──────────────────────────────────────
  pro: {
    label: '🎓 الذكاء المالي',
    color: '#6c63ff',
    tips: [
      { icon: '📐', text: 'قاعدة 50/30/20: 50% للضروريات، 30% للرغبات، 20% للادخار. هذه أفضل نقطة بداية لأي ميزانية.' },
      { icon: '🧾', text: 'صافي ثروتك = أصولك − التزاماتك. احسبها كل 6 أشهر لترى إن كنت تتقدم أو تتراجع.' },
      { icon: '🏗️', text: 'ابنِ طبقات مالية: طوارئ أولاً، ثم ادخار، ثم استثمار. لا تقفز للاستثمار قبل صندوق الطوارئ.' },
      { icon: '📉', text: 'التضخم يأكل مدخراتك. ريالك اليوم يساوي أقل بعد 5 سنوات — استثمر ما لا تحتاجه.' },
      { icon: '🔁', text: 'الأتمتة المالية: حوّل نسبة الادخار تلقائياً في نفس يوم الراتب قبل ما تصرف.' },
      { icon: '📊', text: 'تتبع "معدل الادخار" لا "المبلغ المدخر". 20% من 5000 أفضل استراتيجياً من 500 من 10000 عشوائياً.' },
      { icon: '⚖️', text: 'الالتزامات الثابتة يجب ألا تتجاوز 40% من دخلك — ما فوق ذلك يقيّد حريتك المالية.' },
      { icon: '🧠', text: 'التحيّز الحاضر يجعلك تفضّل اللذة الآنية. اعرف هذا عن نفسك وخطط لمكافحته.' },
      { icon: '💼', text: 'فكّر في دخلك كـ"ساعة عمل": هل هذا الشراء يستحق X ساعة من حياتك؟' },
      { icon: '🗂️', text: 'راجع تقريرك الائتماني سنوياً — الأخطاء فيه تكلّفك مبالغ طائلة على المدى البعيد.' },
    ]
  },

  // ── نصائح للمبذر ────────────────────────────────────────
  spender: {
    label: '🛑 خلك واعي',
    color: '#f87171',
    tips: [
      { icon: '🚨', text: 'قبل الشراء اسأل نفسك: هل سأندم على هذا بعد أسبوع؟ غالباً الجواب نعم.' },
      { icon: '🛒', text: 'لا تدخل أي متجر أو موقع تسوق وأنت جائع أو حزين أو بدون قائمة محددة.' },
      { icon: '💳', text: 'غيّر الدفع للنقد أو بطاقة مدى فقط. الألم النفسي عند دفع النقد يقلل الإنفاق 23%.' },
      { icon: '📦', text: 'قاعدة "واحد يدخل واحد يخرج": كل ما تشتري شيئاً جديداً، تبرع أو بع شيئاً قديماً.' },
      { icon: '🔄', text: 'قاعدة 48 ساعة للمشتريات فوق 200 ر.س. انتظر يومين كاملين قبل الضغط على "اشترِ".' },
      { icon: '📵', text: 'ألغِ تطبيقات التسوق من هاتفك أو أخفِ بياناتك البنكية منها — الاحتكاك يقلل الإنفاق.' },
      { icon: '🎭', text: 'الإنفاق العاطفي حقيقي. احتفظ بمذكرة مزاجك قبل الشراء لتكتشف نمطك.' },
      { icon: '📋', text: 'افعل "تدقيق الاشتراكات" كل شهر: اجمع كل اشتراكاتك واسأل — هل استخدمتها أكثر من مرتين؟' },
      { icon: '🏷️', text: 'الخصومات ليست توفيراً — شراء شيء بـ50% خصم لا تحتاجه هو إضاعة لـ50% من سعره.' },
      { icon: '👥', text: 'تجنب التسوق مع الأصدقاء المبذرين — الضغط الاجتماعي يرفع إنفاقك بشكل لا تشعر به.' },
    ]
  },

  // ── نصائح عملية للفرد العادي ───────────────────────────
  practical: {
    label: '🛠️ من الواقع',
    color: '#10b981',
    tips: [
      { icon: '🍳', text: 'حضّر وجبتين في الأسبوع بدل الطلب — يوفر 300-600 ر.س شهرياً دون أي تضحية كبيرة.' },
      { icon: '⛽', text: 'جمّع مشاويرك في يوم واحد أو يومين بدل التجوال يومياً — توفير الوقود يتراكم بسرعة.' },
      { icon: '🔌', text: 'افصل الأجهزة الكهربائية من الكهرباء عند عدم الاستخدام — خاصة الأجهزة الكبيرة.' },
      { icon: '📱', text: 'قارن أسعار الاتصالات كل سنة — الشركات تقدم عروضاً أفضل للعملاء الجدد.' },
      { icon: '🛍️', text: 'اعمل قائمة مشتريات قبل الذهاب للسوبرماركت والتزم بها — يقلل الإنفاق 30% فوراً.' },
      { icon: '🎁', text: 'ضع ميزانية للهدايا مسبقاً. المناسبات متوقعة — لا تتفاجأ بها كل مرة.' },
      { icon: '🚗', text: 'احسب التكلفة الكاملة للسيارة: قسط + تأمين + وقود + صيانة. هل تساوي هذه النسبة؟' },
      { icon: '🏥', text: 'الوقاية أرخص من العلاج — الفحوصات الدورية والرياضة استثمار مالي حقيقي.' },
      { icon: '📚', text: 'استبدل اشتراك واحد بالمكتبة العامة أو تطبيقات مجانية — المعرفة لا تكلف كثيراً.' },
      { icon: '🔧', text: 'تعلم مهارة صيانة بسيطة واحدة — سباكة أو كهرباء بسيطة توفر 200-500 ر.س سنوياً.' },
    ]
  },

  // ── النصائح الأساسية (الأصلية) ──────────────────────────
  general: {
    label: '💡 مهمة',
    color: '#38bdf8',
    tips: [
      { icon: '💡', text: 'سجّل كل مصروفاتك يومياً - الأرقام الصغيرة تتراكم بشكل مفاجئ.' },
      { icon: '🎯', text: 'اجعل هدفك توفير 20% من دخلك كل شهر — ابدأ بـ5% إذا كان صعباً.' },
      { icon: '💳', text: 'تجنب الشراء الكمالي عند الضغط النفسي أو الملل — انتظر ساعتين.' },
      { icon: '🏦', text: 'افتح حساب ادخار منفصل وحوّل له تلقائياً أول الشهر قبل ما تصرف.' },
      { icon: '📊', text: 'راجع ميزانيتك كل نهاية شهر وتعلم من أخطائك — بلا نقد لنفسك.' },
      { icon: '🚫', text: 'ألغِ الاشتراكات التي لم تستخدمها أكثر من شهر — افحصها الآن.' },
      { icon: '💰', text: 'ضع 3 أشهر من مصاريفك كاحتياطي طوارئ قبل أي هدف آخر.' },
      { icon: '📱', text: 'استخدم التطبيق يومياً - المتابعة المنتظمة هي مفتاح النجاح المالي.' },
      { icon: '🔄', text: 'قاعدة 24 ساعة: انتظر يوماً كاملاً قبل أي شراء غير ضروري فوق 100 ر.س.' },
      { icon: '📈', text: 'كل ريال تدخره اليوم يساوي أكثر في المستقبل — الزمن هو أقوى سلاح.' },
      { icon: '🍳', text: 'الطبخ في البيت 3 مرات أسبوعياً يوفر أكثر من 300 ر.س شهرياً بسهولة.' },
      { icon: '⛽', text: 'تجميع المشاوير في يوم واحد يقلل مصاريف الوقود بشكل ملحوظ جداً.' },
    ]
  },

  // ── نصائح الاستثمار ─────────────────────────────────────
  invest: {
    label: '📈 شغّل مالك',
    color: '#fbbf24',
    tips: [
      { icon: '🌱', text: 'ابدأ بصندوق طوارئ (3-6 أشهر مصاريف) قبل أي استثمار — هذه قاعدة لا استثناء فيها.' },
      { icon: '📈', text: 'صناديق المؤشرات (ETF) هي أفضل بداية للمستثمر المبتدئ — تنويع تلقائي بتكلفة منخفضة.' },
      { icon: '⏳', text: 'الزمن هو أقوى سلاح مالي. 500 ر.س شهرياً لمدة 20 سنة بعائد 7% = أكثر من 260,000 ر.س.' },
      { icon: '🔄', text: 'استثمار منتظم شهري أفضل من انتظار "الوقت المناسب" — لا أحد يتوقع السوق باستمرار.' },
      { icon: '🏠', text: 'العقار ليس دائماً أفضل استثمار — احسب العائد الفعلي بعد الصيانة والضرائب والشاغر.' },
      { icon: '⚠️', text: 'أي استثمار يعد عائداً فوق 20% سنوياً بضمان — هو على الأرجح نصب. لا يوجد غداء مجاني.' },
      { icon: '🌍', text: 'نوّع استثماراتك جغرافياً — لا تضع كل أموالك في سوق واحد أو قطاع واحد.' },
      { icon: '💎', text: 'الذهب ليس استثماراً للنمو — هو تحوط ضد التضخم. لا يتجاوز 10-15% من محفظتك.' },
      { icon: '🧘', text: 'الاستثمار الأفضل هو الذي تستطيع النوم بسببه. إذا قلق استثمارك نومك — مخاطرة فوق طاقتك.' },
      { icon: '📖', text: 'قبل أي استثمار: افهم كيف يجني المشروع أمواله. إذا ما فهمت — لا تستثمر فيه.' },
    ]
  }
};

// ── بناء القائمة المسطّحة للتنقل الدوري ─────────────────
const ALL_TIPS_FLAT = Object.entries(TIPS_BANK).flatMap(([cat, data]) =>
  data.tips.map(t => ({ ...t, cat, catLabel: data.label, catColor: data.color }))
);

// ── الفئة النشطة والمؤشر ─────────────────────────────────
let activeCat    = 'all';
let tipIndex     = Math.floor(Math.random() * ALL_TIPS_FLAT.length);
let shownTipIds  = new Set();

function getNextTipFromCat(cat) {
  const pool = cat === 'all'
    ? ALL_TIPS_FLAT
    : ALL_TIPS_FLAT.filter(t => t.cat === cat);
  if (!pool.length) return ALL_TIPS_FLAT[0];

  // اختر غير مُشاهَد إذا أمكن
  const unseen = pool.filter((_, i) => !shownTipIds.has(i));
  const source = unseen.length ? unseen : pool;
  const tip = source[Math.floor(Math.random() * source.length)];
  const idx = ALL_TIPS_FLAT.indexOf(tip);
  shownTipIds.add(idx);
  if (shownTipIds.size > ALL_TIPS_FLAT.length * 0.8) shownTipIds.clear();
  return tip;
}

// ── عرض بطاقة النصيحة داخل النافذة ─────────────────────
function showNextTip(btn, cat) {
  if (cat) activeCat = cat;
  const overlay = btn ? btn.closest('.ai-overlay') : null;
  const tip = getNextTipFromCat(activeCat);

  if (!overlay) { showNotification(tip.icon, tip.text, 6000); return; }

  // حذف البطاقة القديمة
  overlay.querySelector('.extra-tip')?.remove();

  const tipCard = document.createElement('div');
  tipCard.className = 'extra-tip';
  tipCard.style.cssText = `
    background: ${tip.catColor}15;
    border: 1px solid ${tip.catColor}40;
    border-radius: 13px;
    padding: 14px 15px;
    margin-bottom: 12px;
  `;

  tipCard.innerHTML = `
    <div style="
      display:flex; align-items:center; gap:6px;
      margin-bottom:8px;
    ">
      <span style="
        font-size:0.65rem; font-weight:700;
        color:${tip.catColor};
        background:${tip.catColor}20;
        padding:2px 8px; border-radius:99px;
        letter-spacing:0.3px;
      ">${tip.catLabel}</span>
    </div>
    <div style="display:flex; gap:10px; align-items:flex-start;">
      <span style="font-size:1.3rem; flex-shrink:0; margin-top:1px;">${tip.icon}</span>
      <div style="flex:1; font-size:0.86rem; line-height:1.65; color:var(--text,#eee);">${tip.text}</div>
    </div>
  `;

  // أدرجها قبل صف الأزرار
  const btnRow = overlay.querySelector('.ai-btn-row');
  if (btnRow) btnRow.parentElement.insertBefore(tipCard, btnRow);
  else        overlay.querySelector('div').appendChild(tipCard);

  tipCard.animate(
    [{ transform:'translateY(10px)', opacity:0 }, { transform:'translateY(0)', opacity:1 }],
    { duration:320, easing:'cubic-bezier(0.34,1.56,0.64,1)' }
  );
}

// ── تحديث زر الفئة النشطة ────────────────────────────────
function setTipCat(btn, cat) {
  activeCat = cat;
  const overlay = btn.closest('.ai-overlay');
  if (!overlay) return;

  // تحديث أنماط الأزرار
  overlay.querySelectorAll('.cat-btn').forEach(b => {
    const isActive = b.dataset.cat === cat;
    b.style.background = isActive ? TIPS_BANK[cat]?.color || '#6c63ff' : 'var(--surface2,#1e2130)';
    b.style.color       = isActive ? '#fff' : 'var(--muted,#888)';
    b.style.borderColor = isActive ? TIPS_BANK[cat]?.color || '#6c63ff' : 'var(--border,#2a2d3a)';
  });

  showNextTip(btn, cat);
}

// للتوافق مع الكود القديم
function showQuickTip() {
  const tip = getNextTipFromCat('all');
  showNotification(tip.icon, tip.text, 6000);
}

// ── HTML أزرار الفئات (يُستخدم في showAIReport) ──────────
function buildCatButtonsHTML() {
  const cats = [
    { key: 'all',       label: '🎲 فاجئني',        color: '#6c63ff' },
    { key: 'general',   label: '💡 مهمة',           color: '#38bdf8' },
    { key: 'practical', label: '🛠️ من الواقع',     color: '#10b981' },
    { key: 'spender',   label: '🛑 خلك واعي',       color: '#f87171' },
    { key: 'pro',       label: '🎓 الذكاء المالي',  color: '#8b5cf6' },
    { key: 'invest',    label: '📈 شغّل مالك',      color: '#fbbf24' },
  ];
  return `
    <div style="
      display:flex; gap:6px; flex-wrap:wrap;
      margin-bottom:14px;
    ">
      ${cats.map((c, i) => `
        <button
          class="cat-btn"
          data-cat="${c.key}"
          onclick="setTipCat(this,'${c.key}')"
          style="
            padding:5px 11px;
            font-size:0.72rem; font-weight:600;
            border-radius:99px; cursor:pointer;
            border: 1px solid ${i === 0 ? c.color : 'var(--border,#2a2d3a)'};
            background: ${i === 0 ? c.color : 'var(--surface2,#1e2130)'};
            color: ${i === 0 ? '#fff' : 'var(--muted,#888)'};
            font-family: var(--font,inherit);
            transition: all 0.2s;
            white-space:nowrap;
          "
        >${c.label}</button>
      `).join('')}
    </div>
  `;
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
window.setTipCat   = setTipCat;
