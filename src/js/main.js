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

/* ------- Mobile nav ------- */
const burger = $("#dartBurger");
const nav = $("#dartNav");
const closeNav = () => nav?.classList.remove("dart-header__nav--open");
burger?.addEventListener("click", () => nav?.classList.toggle("dart-header__nav--open"));
nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));

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
