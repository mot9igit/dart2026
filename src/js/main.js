import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import { Fancybox } from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

import 'swiper/css';

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

/* ------- Modal open / close ------- */
const modal = $("#dartModal");
const openModal = (el) => {
  if (!el) return;
  el.classList.add("is-active");
  document.body.classList.add("dart-modal-open");
};
const closeModal = (el) => {
  if (!el) return;
  el.classList.remove("is-active");
  document.body.classList.remove("dart-modal-open");
};

$$("[data-modal]").forEach((btn) => {
  btn.addEventListener("click", () => openModal($(`#${btn.dataset.modal}`)));
});

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-modal-close]")) {
    closeModal(e.target.closest(".dart-modal"));
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal(modal);
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
