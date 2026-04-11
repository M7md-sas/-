/**
 * 🤖 AI Financial Advisor - Enhanced Version
 * نظام الذكاء الاصطناعي المالي المحسّن
 */

// ====================================
// 1. استخراج البيانات المالية من الصفحة
// ====================================
function getFinancialData() {
  let income = 0;
  let expenses = 0;
  let balance = 0;

  // استخراج الدخل والمصروفات من البطاقات
  const cards = document.querySelectorAll('.sum-value');
  cards.forEach(card => {
    const value = parseInt(card.textContent.replace(/[^0-9]/g, '')) || 0;
    const parent = card.closest('.sum-card');
    if (!parent) return;

    const label = parent.querySelector('.sum-label')?.textContent || '';
    if (label.includes('الدخل')) income = value;
    if (label.includes('المصروف')) expenses = value;
  });

  // استخراج الرصيد من wallet
  const walletBalance = document.querySelector('.w-bal');
  if (walletBalance) {
    balance = parseInt(walletBalance.textContent.replace(/[^0-9]/g, '')) || 0;
  }

  return { income, expenses, balance };
}

// ====================================
// 2. تحليل البيانات وإعطاء نصائح
// ====================================
function analyzeFinances(data) {
  const { income, expenses, balance } = data;
  const insights = [];

  if (income === 0) {
    return {
      score: 0,
      insights: [{ icon: '📊', message: 'أضف دخلك الشهري أولاً' }],
      time: getCurrentTime()
    };
  }

  // حساب النسب المالية
  const spendingRate = (expenses / income) * 100;
  const savingsRate = 100 - spendingRate;
  const healthScore = calculateHealthScore(spendingRate, balance, income);

  // التحليل والنصائح
  if (spendingRate > 80) {
    insights.push({
      icon: '🚨',
      message: `تنفق أكثر من 80%! (${spendingRate.toFixed(0)}%) - قلل المصروفات فوراً`
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

  // تحليل الرصيد
  if (balance <= 0) {
    insights.push({
      icon: '🚨',
      message: 'رصيدك سالب أو صفر - قلل المصروفات بسرعة'
    });
  } else if (balance > income) {
    insights.push({
      icon: '🎯',
      message: `مدخرات ممتازة (${balance} ر.س) - استثمر جزء منها`
    });
  } else if (balance > income / 2) {
    insights.push({
      icon: '👍',
      message: `رصيد جيد (${balance} ر.س) - استمر في المدخرات`
    });
  } else if (balance > 0) {
    insights.push({
      icon: '💡',
      message: `زيادة المدخرات (${balance} ر.س) - حاول توفير أكثر`
    });
  }

  return {
    score: healthScore,
    insights: insights,
    time: getCurrentTime(),
    spendingRate: spendingRate.toFixed(0),
    savingsRate: savingsRate.toFixed(0)
  };
}

// ====================================
// 3. حساب درجة الصحة المالية
// ====================================
function calculateHealthScore(spendingRate, balance, income) {
  let score = 50;

  // نسبة الإنفاق (40%)
  if (spendingRate <= 50) {
    score += Math.min(40, (50 - spendingRate) * 0.8);
  } else {
    score -= Math.min(40, (spendingRate - 50) * 0.8);
  }

  // الرصيد (10%)
  if (balance > income) score += 10;
  else if (balance > 0) score += 5;

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
  const data = getFinancialData();
  const analysis = analyzeFinances(data);
  const scoreColor = getScoreColor(analysis.score);

  // إنشاء overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-end;
    z-index: 5000;
    animation: slideUp 0.3s ease;
  `;

  // محتوى النافذة
  const insightsHTML = analysis.insights
    .map(
      (item) => `
    <div style="
      background: var(--surface2);
      border-right: 3px solid var(--accent);
      border-radius: 9px;
      padding: 12px;
      margin-bottom: 10px;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    ">
      <span style="font-size: 1.3rem; flex-shrink: 0;">${item.icon}</span>
      <div style="flex: 1; font-size: 0.85rem; line-height: 1.5;">
        ${item.message}
      </div>
    </div>
  `
    )
    .join('');

  overlay.innerHTML = `
    <div style="
      background: var(--surface);
      border-radius: 20px 20px 0 0;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      padding: 20px;
      padding-bottom: calc(20px + env(safe-area-inset-bottom));
      animation: slideUp 0.4s ease;
    ">
      <!-- العنوان -->
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 3rem; margin-bottom: 10px; animation: pulse 2s infinite;">🤖</div>
        <h2 style="margin: 0; font-size: 1rem; font-weight: 700; color: var(--text);">
          مستشارك المالي الذكي
        </h2>
      </div>

      <!-- درجة الصحة -->
      <div style="
        background: linear-gradient(135deg, ${scoreColor}, ${scoreColor}dd);
        border-radius: 13px;
        padding: 20px;
        text-align: center;
        margin-bottom: 20px;
        color: white;
      ">
        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 10px;">
          درجة الصحة المالية
        </div>
        <div style="font-size: 3rem; font-weight: 800; margin-bottom: 15px;">
          ${analysis.score}%
        </div>
        <div style="
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 10px;
        ">
          <div style="
            height: 100%;
            background: rgba(255, 255, 255, 0.5);
            width: ${analysis.score}%;
            transition: width 0.5s ease;
          "></div>
        </div>
        <div style="font-size: 0.75rem; opacity: 0.9;">
          إنفاق: ${analysis.spendingRate}% | توفير: ${analysis.savingsRate}%
        </div>
      </div>

      <!-- النصائح -->
      <div style="margin-bottom: 20px;">
        <div style="
          font-size: 0.75rem;
          color: var(--muted);
          text-transform: uppercase;
          margin-bottom: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
        ">
          📋 النصائح والإرشادات
        </div>
        ${insightsHTML}
      </div>

      <!-- الوقت -->
      <div style="
        background: rgba(108, 99, 255, 0.1);
        border-right: 3px solid var(--accent);
        border-radius: 9px;
        padding: 12px;
        margin-bottom: 20px;
        font-size: 0.8rem;
        color: var(--muted);
      ">
        ⏰ آخر تحديث: ${analysis.time}
      </div>

      <!-- الأزرار -->
      <div style="display: flex; gap: 10px;">
        <button onclick="this.closest('div').parentElement.remove()" style="
          flex: 1;
          padding: 12px;
          background: var(--accent);
          color: white;
          border: 0;
          border-radius: 10px;
          font-family: var(--font);
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
          فهمت ✓
        </button>
        <button onclick="showQuickTip()" style="
          flex: 1;
          padding: 12px;
          background: var(--surface2);
          color: var(--accent);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-family: var(--font);
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        " onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background='var(--surface2)'">
          نصيحة أخرى 💡
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // إغلاق عند النقر خارج النافذة
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
}

// ====================================
// 6. نصائح سريعة عشوائية
// ====================================
function showQuickTip() {
  const tips = [
    '💡 سجل كل مصروفاتك يومياً',
    '🎯 اجعل هدفك توفير 20-30% من دخلك',
    '💳 تجنب الإنفاق الكمالي غير الضروري',
    '🏦 افتح حساب ادخار منفصل',
    '📊 راجع ميزانيتك كل نهاية شهر',
    '🚫 قلل الاشتراكات غير الضرورية',
    '💰 فكر في استثمار مدخراتك',
    '📱 استخدم التطبيق بانتظام'
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  showNotification('💡', randomTip, 5000);
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
  // أضف الأنماط
  if (!document.getElementById('ai-styles')) {
    const style = document.createElement('style');
    style.id = 'ai-styles';
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
  }

  console.log('✅ نظام AI المالي جاهز!');
});

// ====================================
// 10. تعريف الدوال العامة
// ====================================
window.showAI = showAIReport;
window.showTip = showQuickTip;
