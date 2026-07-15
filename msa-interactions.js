(() => {
  const modules = {
    variable: { number: "01", title: "Variable Gage R&R", caseStudy: "Đánh giá micrometer 0–25 mm khi đo đường kính Ø1.55 ±0.02 mm.", lessons: ["Chọn đặc tính và dụng cụ đo", "Thiết kế Crossed Study", "Phân tách EV, AV và PV", "Đọc %GRR, ndc và biểu đồ"] },
    attribute: { number: "02", title: "Attribute MSA", caseStudy: "Xác nhận năng lực kiểm ngoại quan ba via và phân loại ren bằng ring gage.", lessons: ["Chuẩn bị mẫu biên", "Appraiser Agreement", "Agreement với Reference", "Kappa và quyết định cải tiến"] },
    bias: { number: "03", title: "Bias & Linearity", caseStudy: "Kiểm tra micrometer tại nhiều điểm chuẩn trong toàn bộ dải sử dụng.", lessons: ["Reference value và Bias", "Kiểm định ý nghĩa thống kê", "Linearity theo dải đo", "Lập hành động hiệu chỉnh"] },
    stability: { number: "04", title: "Stability & Resolution", caseStudy: "Theo dõi độ ổn định hằng ngày của thiết bị đo trên chuyền tiện chính xác.", lessons: ["Chọn resolution phù hợp", "Theo dõi master sample", "Control chart cho Stability", "Phân biệt calibration và MSA"] },
  };
  const totalLessons = 16;
  let completed = [];
  let activeModule = "variable";
  const answers = [-1, -1, -1];
  const correct = [1, 0, 1];

  try { completed = JSON.parse(localStorage.getItem("msa-completed-lessons") || "[]"); } catch { completed = []; }

  const one = (selector) => document.querySelector(selector);
  const all = (selector) => [...document.querySelectorAll(selector)];

  function updateProgress() {
    const progress = Math.round((completed.length / totalLessons) * 100);
    all("[data-progress-percent]").forEach((el) => { el.textContent = `${progress}%`; });
    const value = one("[data-progress-value]"); if (value) value.textContent = String(progress);
    const fraction = one("[data-progress-fraction]"); if (fraction) fraction.textContent = `${completed.length}/${totalLessons}`;
    const copy = one("[data-progress-copy]"); if (copy) copy.textContent = `${completed.length} / ${totalLessons} bài đã hoàn thành`;
    const bar = one("[data-progress-bar]"); if (bar) bar.style.width = `${progress}%`;
    const ring = one("[data-progress-ring]"); if (ring) ring.style.setProperty("--progress", `${progress * 3.6}deg`);
  }

  function renderLessons() {
    const module = modules[activeModule];
    all(".module-tabs [data-module]").forEach((button) => {
      const selected = button.dataset.module === activeModule;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    const number = one("[data-module-number]"); if (number) number.textContent = `MODULE ${module.number}`;
    const title = one("[data-module-title]"); if (title) title.textContent = module.title;
    const caseStudy = one("[data-module-case]"); if (caseStudy) caseStudy.textContent = module.caseStudy;
    const list = one("[data-lesson-list]");
    if (!list) return;
    list.innerHTML = module.lessons.map((lesson, index) => {
      const key = `${activeModule}-${index}`;
      const done = completed.includes(key);
      return `<button data-lesson-key="${key}" class="${done ? "done" : ""}"><span>${done ? "✓" : index + 1}</span><div><strong>${lesson}</strong><small>${done ? "Đã hoàn thành" : "12–18 phút"}</small></div><i>${done ? "Bỏ đánh dấu" : "Hoàn thành"}</i></button>`;
    }).join("");
  }

  function updateCalculator() {
    const getValue = (key) => Number(one(`[data-range="${key}"]`)?.value || 0);
    const ev = getValue("eq");
    const av = getValue("ap");
    const pv = getValue("pa");
    [["eq", ev], ["ap", av], ["pa", pv]].forEach(([key, value]) => { const el = one(`[data-range-value="${key}"]`); if (el) el.textContent = Number(value).toFixed(1); });
    const grr = Math.sqrt(ev ** 2 + av ** 2);
    const tv = Math.sqrt(grr ** 2 + pv ** 2);
    const percent = tv ? (grr / tv) * 100 : 0;
    const ndc = grr ? 1.41 * (pv / grr) : 0;
    const good = percent < 10;
    const warn = percent >= 10 && percent <= 30;
    const card = one("[data-result-card]");
    if (card) { card.classList.remove("good", "warn", "bad"); card.classList.add(good ? "good" : warn ? "warn" : "bad"); }
    const values = { "[data-grr]": grr.toFixed(2), "[data-percent-grr]": percent.toFixed(1), "[data-tv]": tv.toFixed(2), "[data-ndc]": String(Math.floor(ndc)) };
    Object.entries(values).forEach(([selector, value]) => { const el = one(selector); if (el) el.textContent = value; });
    const marker = one("[data-scale-marker]"); if (marker) marker.style.left = `${Math.min(percent / 40 * 100, 100)}%`;
    const verdict = one("[data-verdict]"); if (verdict) verdict.textContent = good ? "Có thể chấp nhận" : warn ? "Cân nhắc theo ứng dụng" : "Không chấp nhận";
    const copy = one("[data-verdict-copy]"); if (copy) copy.textContent = good ? "Hệ thống đo nhìn chung phù hợp cho mục đích sử dụng đã đánh giá." : warn ? "Chấp nhận có điều kiện dựa trên mức độ quan trọng, chi phí và rủi ro của đặc tính." : "Measurement variation quá lớn; cần cải tiến trước khi dùng để ra quyết định sản phẩm/quá trình.";
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;
    if (target.matches("[data-menu-button]")) {
      const nav = one(".nav");
      const open = !nav?.classList.contains("open");
      nav?.classList.toggle("open", open);
      target.setAttribute("aria-expanded", String(open));
    }
    if (target.dataset.module && modules[target.dataset.module]) {
      activeModule = target.dataset.module;
      renderLessons();
    }
    if (target.dataset.scrollTo) {
      event.preventDefault();
      document.getElementById(target.dataset.scrollTo)?.scrollIntoView({ behavior: "smooth" });
      one(".nav")?.classList.remove("open");
    }
    if (target.dataset.lessonKey) {
      const key = target.dataset.lessonKey;
      completed = completed.includes(key) ? completed.filter((item) => item !== key) : [...completed, key];
      localStorage.setItem("msa-completed-lessons", JSON.stringify(completed));
      renderLessons();
      updateProgress();
    }
    if (target.dataset.question !== undefined) {
      const question = Number(target.dataset.question);
      answers[question] = Number(target.dataset.option);
      all(`[data-question="${question}"]`).forEach((button) => button.classList.toggle("selected", button === target));
      const submit = one("[data-quiz-submit]"); if (submit) submit.disabled = answers.some((answer) => answer < 0);
      const result = one("[data-quiz-result]"); if (result) result.hidden = true;
    }
    if (target.matches("[data-quiz-submit]")) {
      const score = answers.reduce((sum, answer, index) => sum + (answer === correct[index] ? 1 : 0), 0);
      const result = one("[data-quiz-result]");
      if (result) {
        result.hidden = false;
        result.classList.toggle("pass", score >= 2);
        result.querySelector("strong").textContent = `${score}/3`;
        result.querySelector("span").textContent = score === 3 ? "Xuất sắc — anh đã nắm chắc nền tảng." : score >= 2 ? "Đạt — hãy xem lại câu trả lời chưa đúng." : "Cần ôn lại module nền tảng trước khi tiếp tục.";
      }
    }
  });

  all("[data-range]").forEach((input) => input.addEventListener("input", updateCalculator));
  renderLessons();
  updateProgress();
  updateCalculator();
})();
