import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import { Fancybox } from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

import 'swiper/css';

import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

Prism.manual = true;

Swiper.use([Navigation, Pagination, Autoplay]);

Fancybox.bind("[data-fancybox]", {
  dragToClose: false,
});

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ------- Header scroll state + progress bar ------- */
const header = $("#dartHeader");
const progressBar = $("#dartProgressBar");
const onScroll = () => {
  if (header) {
    header.classList.toggle("dart-header--scrolled", window.scrollY > 20);
  }
  if (progressBar) {
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : "0%";
  }
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ------- Mobile nav + dropdowns ------- */
const burger = $("#dartBurger");
const nav = $("#dartNav");
const isMobile = () => window.matchMedia("(max-width: 1199px)").matches;

let menuScrollY = 0;

const closeNav = () => {
  nav?.classList.remove("dart-header__nav--open");
  burger?.classList.remove("dart-header__burger--active");
  burger?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("dart-menu-open");
  document.body.style.top = "";
  if (menuScrollY) {
    window.scrollTo(0, menuScrollY);
    menuScrollY = 0;
  }
  closeSubmenus();
};

const closeSubmenus = () => {
  $$(".dart-has-menu.is-open").forEach((el) => {
    el.classList.remove("is-open");
    const link = el.querySelector(":scope > .dart-header__nav-link");
    link?.setAttribute("aria-expanded", "false");
  });
};

burger?.addEventListener("click", () => {
  const opening = !nav?.classList.contains("dart-header__nav--open");
  const open = nav?.classList.toggle("dart-header__nav--open");
  burger?.classList.toggle("dart-header__burger--active", !!open);
  burger?.setAttribute("aria-expanded", String(!!open));

  if (opening) {
    menuScrollY = window.scrollY;
    document.body.classList.add("dart-menu-open");
    document.body.style.top = `-${menuScrollY}px`;
  } else {
    closeNav();
  }
});

/* Mobile: tap on parent toggles accordion instead of navigating */
$$(".dart-has-menu > .dart-header__nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    if (!isMobile()) return;
    const item = link.closest(".dart-has-menu");
    const wasOpen = item.classList.contains("is-open");
    // close all then maybe reopen this one
    closeSubmenus();
    if (!wasOpen) {
      e.preventDefault();
      item.classList.add("is-open");
      link.setAttribute("aria-expanded", "true");
    } else {
      e.preventDefault();
      link.setAttribute("aria-expanded", "false");
    }
  });
});

/* Clicking a submenu link on mobile closes the whole nav */
$$(".dart-submenu__link").forEach((a) => a.addEventListener("click", closeNav));

/* Clicking a plain top-level link closes the nav (skip dropdown parents) */
nav?.querySelectorAll("a").forEach((a) => {
  if (a.closest(".dart-has-menu") && a.classList.contains("dart-header__nav-link")) return;
  a.addEventListener("click", closeNav);
});

/* Close menu on outside click (desktop) and Escape */
document.addEventListener("click", (e) => {
  if (nav?.contains(e.target)) return;
  if (burger?.contains(e.target)) return;
  closeNav();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeNav();
  }
});

/* ------- Anchor smooth scroll ------- */
$$('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const id = anchor.getAttribute("href");
    if (id && id.length > 1) {
      const target = $(id);
      if (target) {
        e.preventDefault();
        const offset = header ? header.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  });
});

/* ------- Reveal on scroll ------- */
const revealEls = $$("[data-reveal]");
if ("IntersectionObserver" in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* ------- Animated counters ------- */
const animateCount = (el) => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const counters = $$("[data-count]");
if ("IntersectionObserver" in window && counters.length) {
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => cio.observe(el));
} else {
  counters.forEach(animateCount);
}

/* ------- Typing effect ------- */
const typeEl = $("#dartType");
if (typeEl) {
  const words = ["продают", "превращают", "работают", "вдохновляют", "растут"];
  let wordIdx = 0;
  let charIdx = 0;
  let deleting = false;

  const tick = () => {
    const word = words[wordIdx];
    if (!deleting) {
      charIdx++;
      typeEl.textContent = word.slice(0, charIdx);
      if (charIdx === word.length) {
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
      setTimeout(tick, 110);
    } else {
      charIdx--;
      typeEl.textContent = word.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
      }
      setTimeout(tick, 50);
    }
  };
  tick();
}

/* ------- Tilt effect on [data-tilt] ------- */
$$("[data-tilt]").forEach((el) => {
  const max = 8;
  const update = (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
  };
  el.addEventListener("mousemove", update);
  el.addEventListener("mouseleave", () => {
    el.style.transform = "perspective(800px) rotateY(0) rotateX(0)";
  });
});

/* ------- Process line progress ------- */
const processLine = $("[data-process-line]");
const processSteps = $$("[data-step]");
if (processLine && "IntersectionObserver" in window) {
  const lio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          processLine.classList.add("is-started");
          lio.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  lio.observe(processLine);
}
if (processSteps.length && "IntersectionObserver" in window) {
  const pio2 = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";
          pio2.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  processSteps.forEach((s) => {
    s.style.opacity = 0;
    s.style.transform = "translateY(20px)";
    s.style.transition = "opacity .6s ease, transform .6s ease";
    pio2.observe(s);
  });
}

/* ------- Portfolio Swiper ------- */
const swiperEl = $("#dartPortfolio");
if (swiperEl) {
  const prev = $("#dartPortfolioPrev");
  const next = $("#dartPortfolioNext");
  const dots = $("#dartPortfolioDots");

  const buildDots = (count) => {
    dots.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const b = document.createElement("span");
      b.className = "swiper-pagination-bullet";
      b.style.cursor = "pointer";
      dots.appendChild(b);
    }
    dots.querySelectorAll(".swiper-pagination-bullet").forEach((b, i) => {
      b.addEventListener("click", () => mySwiper.slideTo(i));
    });
  };

  const mySwiper = new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    speed: 700,
    autoplay: { delay: 4000, disableOnInteraction: false },
    navigation: { prevEl: prev, nextEl: next },
    breakpoints: {
      611: { slidesPerView: 2 },
      991: { slidesPerView: 3 },
      1440: { slidesPerView: 3.5 },
    },
    on: {
      init: (sw) => buildDots(sw.slides.length),
      slideChange: (sw) => {
        const real = sw.realIndex;
        dots.querySelectorAll(".swiper-pagination-bullet").forEach((b, i) => {
          b.classList.toggle("swiper-pagination-bullet-active", i === real);
        });
      },
    },
  });
}

/* ------- Portfolio grid filtering ------- */
const pfGrid = $("#pfGrid");
const pfEmpty = $("#pfEmpty");
if (pfGrid) {
  const cells = $$(".pf-cell", pfGrid);
  const filters = $$("#pfFilters .pf-filter");

  const applyFilter = (value) => {
    let visible = 0;
    cells.forEach((cell) => {
      const match = value === "all" || cell.dataset.category === value;
      cell.classList.toggle("is-hidden", !match);
      if (match) visible++;
    });
    if (pfEmpty) pfEmpty.hidden = visible !== 0;
  };

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      applyFilter(btn.dataset.filter);
    });
  });
}

/* ------- Shop category: filters, sort, cart ------- */
const shGrid = $("#shGrid");
if (shGrid) {
  const shItems = $$(".sh-item", shGrid);
  const shCount = $("#shCount");
  const shEmpty = $("#shEmpty");
  const sortSel = $("#shSort");
  const priceMin = $("[data-price-min]");
  const priceMax = $("[data-price-max]");
  const resetBtn = $("#shReset");
  const filterCount = $("#shFilterCount");

  /* --- state --- */
  const state = {
    categories: new Set(),
    features: new Set(),
    packs: new Set(),
    sort: "recent",
    priceMin: 0,
    priceMax: Infinity,
  };

  const itemMatches = (item) => {
    const cat = item.dataset.category;
    const feats = (item.dataset.features || "").split(",").filter(Boolean);
    const packs = (item.dataset.pack || "").split(",").filter(Boolean);
    const price = parseInt(item.dataset.price, 10);

    if (state.categories.size && !state.categories.has(cat)) return false;
    if ([...state.features].some((f) => !feats.includes(f))) return false;
    if ([...state.packs].some((p) => !packs.includes(p))) return false;
    if (price < state.priceMin || price > state.priceMax) return false;
    return true;
  };

  const applyFilters = () => {
    shItems.forEach((item) => {
      item.classList.toggle("is-hidden", !itemMatches(item));
    });

    const visible = shItems.filter((i) => !i.classList.contains("is-hidden")).length;
    if (shCount) shCount.textContent = visible;
    if (shEmpty) shEmpty.hidden = visible !== 0;

    const activeCount =
      state.categories.size + state.features.size + state.packs.size +
      (priceMin ? (state.priceMin > 0 ? 1 : 0) : 0) +
      (priceMax && isFinite(state.priceMax) ? 1 : 0);
    if (filterCount) {
      filterCount.hidden = activeCount === 0;
      filterCount.textContent = activeCount;
    }
  };

  /* --- sort --- */
  const applySort = () => {
    const key = state.sort;
    const sorted = [...shItems].sort((a, b) => {
      if (key === "price-asc") return a.dataset.price - b.dataset.price;
      if (key === "price-desc") return b.dataset.price - a.dataset.price;
      if (key === "name") return a.dataset.name.localeCompare(b.dataset.name, "ru");
      if (key === "popular") return b.dataset.sales - a.dataset.sales;
      return 0;
    });
    sorted.forEach((el) => shGrid.appendChild(el));
    applyFilters();
  };

  if (sortSel) sortSel.addEventListener("change", () => { state.sort = sortSel.value; applySort(); });

  /* --- facet checkboxes --- */
  $$(".sh-side [data-facets]").forEach((group) => {
    const facetKey = group.dataset.facets;
    group.addEventListener("change", (e) => {
      const box = e.target;
      if (!box.dataset.ftype) return;
      const val = box.dataset.ftype;
      (box.checked ? state[facetKey].add(val) : state[facetKey].delete(val));
      applyFilters();
    });
  });

  /* --- price --- */
  if (priceMin) priceMin.addEventListener("input", () => {
    state.priceMin = parseInt(priceMin.value, 10) || 0;
    applyFilters();
  });
  if (priceMax) priceMax.addEventListener("input", () => {
    const v = parseInt(priceMax.value, 10);
    state.priceMax = v ? v : Infinity;
    applyFilters();
  });

  /* --- reset --- */
  if (resetBtn) resetBtn.addEventListener("click", () => {
    state.categories.clear();
    state.features.clear();
    state.packs.clear();
    state.priceMin = 0;
    state.priceMax = Infinity;
    $$(".sh-side [data-ftype]").forEach((i) => (i.checked = false));
    if (priceMin) priceMin.value = "";
    if (priceMax) priceMax.value = "";
    applyFilters();
  });

  /* --- mobile sidebar --- */
  const side = $("#shSide");
  $$("[data-side-open]").forEach((b) => b.addEventListener("click", () => {
    side.classList.add("is-active");
    document.body.classList.add("sh-side-open");
  }));
  $$("[data-side-close]").forEach((b) => b.addEventListener("click", () => {
    side.classList.remove("is-active");
    document.body.classList.remove("sh-side-open");
  }));

  /* --- favorites --- */
  $$("[data-fav]").forEach((btn) => btn.addEventListener("click", () => btn.classList.toggle("is-active")));

  /* show sticky bar after scrolling past hero */
  const sticky = $("#shSticky");
  const shHero = document.querySelector(".sh-hero");
  const onScroll = () => {
    if (!sticky) return;
    const show = shHero ? window.scrollY > shHero.offsetHeight * 0.6 : window.scrollY > 600;
    sticky.hidden = !show;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  applyFilters();

  /* --- "Подробнее" opens contact/order modal with product name --- */
  shGrid.addEventListener("click", (e) => {
    const more = e.target.closest("[data-more]");
    if (!more) return;
    const item = more.closest(".sh-item");
    const title = item ? (item.querySelector(".sh-item__title a") || {}).textContent : "";
    const qModal = resolveModalEl("question");
    if (qModal) {
      const msg = qModal.querySelector('textarea[name="message"]');
      if (msg && title) msg.value = "Интересует: " + title;
      openModal(qModal);
    }
  });
}

/* ------- Solution page: tabs + sticky buy bar ------- */
const slTabs = $("#slTabs");
if (slTabs) {
  const tabs = $$(".sl-tab", slTabs);
  const panes = $$(".sl-pane");

  const showTab = (name) => {
    tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.tab === name));
    panes.forEach((p) => p.classList.toggle("is-active", p.dataset.pane === name));
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => showTab(tab.dataset.tab)));

  /* gallery thumbs */
  $$(".sl-thumb").forEach((th) => th.addEventListener("click", () => {
    $$(".sl-thumb").forEach((t) => t.classList.remove("is-active"));
    th.classList.add("is-active");
  }));
}

const slSticky = $("#slSticky");
if (slSticky) {
  const slProduct = document.querySelector(".sl-product");
  const slStickyScroll = () => {
    const show = slProduct ? window.scrollY > slProduct.offsetHeight * 0.5 : window.scrollY > 600;
    slSticky.hidden = !show;
  };
  window.addEventListener("scroll", slStickyScroll, { passive: true });
  slStickyScroll();
}

/* ------- Cookie notification ------- */
const cookieNotice = $("#dartCookie");
const COOKIE_NAME = "dart_cookie_accept";
const COOKIE_DAYS = 14;

const getCookie = (name) => {
  const cookie = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return cookie ? cookie.slice(name.length + 1) : null;
};

const setCookie = (name, value, days) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const acceptCookie = () => {
  setCookie(COOKIE_NAME, "1", COOKIE_DAYS);
  document.body.classList.remove("dart-cookie-open");
  cookieNotice?.classList.remove("cookie_notification__show");
};

if (cookieNotice && !getCookie(COOKIE_NAME)) {
  setTimeout(() => {
    document.body.classList.add("dart-cookie-open");
    cookieNotice.classList.add("cookie_notification__show");
  }, 800);
  $$(".cookie_accept", cookieNotice).forEach((btn) => btn.addEventListener("click", acceptCookie));
}

/* ------- Modal open / close (multi-modal) ------- */
const modal = $("#dartModal");

/* map of convenient modal names -> element id */
const MODAL_NAMES = {
  callback: "dartModalCallback",
  question: "dartModalQuestion",
  demo: "dartModalDemo",
  order: "dartModalOrder",
  review: "dartModalReview",
  default: "dartModal",
  dartModal: "dartModal",
};

const resolveModalEl = (target) => {
  if (!target) return null;
  let id = String(target).trim().replace(/^#/, "");
  if (MODAL_NAMES[id]) id = MODAL_NAMES[id];
  return $(`#${id}`);
};

const openModal = (el, btn) => {
  if (!el) return;
  /* only one modal at a time */
  $$(".dart-modal.is-active").forEach((m) => m.classList.remove("is-active"));
  /* optional prefill from the triggering button */
  if (btn) {
    const t = el.querySelector("[data-modal-title]");
    const msg = el.querySelector("textarea[name='message']");
    if (t && !t.dataset.originalTitle) t.dataset.originalTitle = t.textContent;
    if (msg && !msg.dataset.originalValue) msg.dataset.originalValue = "";
    if (t) t.textContent = btn.getAttribute("data-modal-title") || t.dataset.originalTitle;
    if (msg) msg.value = btn.getAttribute("data-modal-message") || btn.dataset.product || msg.dataset.originalValue;
  }
  el.classList.add("is-active");
  document.body.classList.add("dart-modal-open");
};

const closeModal = (el) => {
  if (!el) return;
  el.classList.remove("is-active");
  if (!$(".dart-modal.is-active")) document.body.classList.remove("dart-modal-open");
};

/* open via data-target (id or name) */
$$("[data-target]").forEach((btn) => {
  btn.addEventListener("click", () => openModal(resolveModalEl(btn.dataset.target), btn));
});
/* backwards-compatible open via data-modal */
$$("[data-modal]").forEach((btn) => {
  btn.addEventListener("click", () => openModal(resolveModalEl(btn.dataset.modal), btn));
});

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-modal-close]")) {
    closeModal(e.target.closest(".dart-modal"));
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const active = $(".dart-modal.is-active") || modal;
    closeModal(active);
  }
});

/* ------- Form success state ------- */
$$("[data-form]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const success = document.createElement("div");
    success.className = "dart-form-success";
    success.innerHTML =
      '<span class="dart-form-success__icon">✓</span>' +
      "<b>Заявка принята!</b>" +
      "<p>Перезвоним в течение 30 минут в рабочее время.</p>";
    form.replaceWith(success);
  });
});

/* ------- FAQ accordion ------- */
$$(".sv-faq__item").forEach((item) => {
  const btn = item.querySelector(".sv-faq__q");
  const body = item.querySelector(".sv-faq__a");
  btn?.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");
    $$(".sv-faq__item.is-open").forEach((i) => {
      i.classList.remove("is-open");
      const b = i.querySelector(".sv-faq__a");
      if (b) b.style.maxHeight = "";
    });
    if (!isOpen) {
      item.classList.add("is-open");
      if (body) body.style.maxHeight = `${body.scrollHeight}px`;
    }
  });
});

/* ------- Scrollspy for sticky sub-nav ------- */
const navLinks = $$("#svNav .sv-nav__link");
if (navLinks.length && "IntersectionObserver" in window) {
  const targets = navLinks
    .map((l) => $(l.getAttribute("href")))
    .filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((l) =>
            l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`)
          );
        }
      });
    },
    { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
  );
  targets.forEach((s) => spy.observe(s));
}

/* ------- Blog post: code copy ------- */
$$("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-copy");
    const code = $(`#${id}`);
    if (!code) return;
    const text = code.textContent;
    const done = () => {
      btn.classList.add("is-copied");
      const orig = btn.textContent;
      btn.textContent = "Скопировано ✓";
      setTimeout(() => {
        btn.classList.remove("is-copied");
        btn.textContent = orig;
      }, 1800);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  });
});

function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    done();
  } catch (e) {
    // ignore
  }
  document.body.removeChild(ta);
}

/* ------- Blog post: syntax highlight code blocks ------- */
document.querySelectorAll("pre code[class*='language-']").forEach((el) => {
  Prism.highlightElement(el);
});

/* ------- Blog post: mobile TOC toggle ------- */
$$("[data-toc-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const wrap = btn.closest(".po-side__toc-mobile");
    wrap?.classList.toggle("is-open");
    const arrow = btn.querySelector("span");
    if (arrow) arrow.textContent = wrap?.classList.contains("is-open") ? "▴" : "▾";
  });
});

/* ------- Blog post: comment reply ------- */
$$("[data-reply]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.getAttribute("data-reply");
    const form = $(".po-comments__form");
    if (!form) return;
    const textarea = form.querySelector("textarea");
    if (textarea) {
      textarea.value = `@${name}, `;
      textarea.focus();
    }
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

/* ------- Blog post: reading-state TOC / scrollspy ------- */
const tocLinks = $$(".po-side__toc-list a");
if (tocLinks.length && "IntersectionObserver" in window) {
  const targets = tocLinks.map((l) => $(l.getAttribute("href"))).filter(Boolean);
  const tocSpy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          tocLinks.forEach((l) =>
            l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`)
          );
        }
      });
    },
    { rootMargin: "-120px 0px -70% 0px", threshold: 0 }
  );
  targets.forEach((s) => tocSpy.observe(s));
}

/* ------- Brief: multi-step form ------- */
const brForm = $(".br-form");
if (brForm) {
  const steps = $$(".br-step", brForm);
  const panels = $$(".br-panel", brForm);
  const prevBtn = $("#brPrev");
  const nextBtn = $("#brNext");
  const submitBtn = $("#brSubmit");
  let current = 1;
  let maxVisited = 1;

  const goTo = (n) => {
    current = Math.min(Math.max(n, 1), panels.length);
    if (current > maxVisited) maxVisited = current;
    panels.forEach((p) => p.classList.toggle("is-active", +p.dataset.panel === current));
    steps.forEach((s) => {
      const sn = +s.dataset.step;
      s.classList.toggle("is-active", sn === current);
      s.classList.toggle("is-done", sn < current);
    });
    prevBtn.style.display = current === 1 ? "none" : "";
    const last = current === panels.length;
    nextBtn.style.display = last ? "none" : "";
    submitBtn.style.display = last ? "" : "none";
    brForm.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const panelValid = (panel) =>
    $$("select[required], input[type='radio'][required]", panel).every((el) => {
      if (el.type === "radio") {
        return !!panel.querySelector(`input[name="${el.name}"]:checked`);
      }
      return !!el.value;
    }) &&
    panel.checkValidity();

  steps.forEach((s) => {
    s.addEventListener("click", () => {
      const target = +s.dataset.step;
      if (target > maxVisited) return;
      goTo(target);
    });
  });
  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => {
    const panel = panels.find((p) => +p.dataset.panel === current);
    if (!panelValid(panel)) {
      const first = panel.querySelector(":invalid");
      if (first) first.focus();
      return;
    }
    goTo(current + 1);
  });

  brForm.addEventListener("submit", (e) => {
    if (!panelValid(panels.find((p) => +p.dataset.panel === current)) || !brForm.checkValidity()) {
      e.preventDefault();
      return;
    }
  });
}
