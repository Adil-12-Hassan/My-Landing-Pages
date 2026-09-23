
// DOCTOR DENTIST INTERACTIONS
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navigationItems = document.querySelectorAll(".nav-links a");
const allAnchorLinks = document.querySelectorAll("a[href^='#']");
const API_BASE_URL = window.APP_API || "";

const closeMobileMenu = () => {
    if (!menuToggle || !navLinks) {
        return;
    }

    navLinks.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
};
// NAVBAR MOBILE MENU
if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });
}

navigationItems.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
});

document.addEventListener("click", (event) => {
    if (!navLinks || !menuToggle || !navLinks.classList.contains("active")) {
        return;
    }

    const clickedInsideNav = navLinks.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideNav && !clickedToggle) {
        closeMobileMenu();
    }
});

// SMOOTH SCROLLING
allAnchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }
        const targetSection = document.querySelector(targetId);
        if (!targetSection) {
            return;
        }
        event.preventDefault();
        targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});
// SCROLLED HEADER AND ACTIVE NAVIGATION
const sections = [...document.querySelectorAll("main section[id]")];

const updateHeaderState = () => {
    if (siteHeader) {
        siteHeader.classList.toggle("is-scrolled", window.scrollY > 20);
    }
};
const setActiveNavigation = () => {
    const scrollPosition = window.scrollY + 140;
    let currentId = "home";

    sections.forEach((section) => {
        if (section.offsetTop <= scrollPosition) {
            currentId = section.id;
        }
    });
    navigationItems.forEach((link) => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${currentId}`
        );
    });
};
window.addEventListener("scroll", () => {
    updateHeaderState();
    setActiveNavigation();
});

// HERO IMAGE SUBTLE PARALLAX
const heroImage = document.querySelector(".hero-image");
if (heroImage) {
    window.addEventListener("scroll", () => {
        if (window.innerWidth <= 768 || window.scrollY > window.innerHeight) {
            return;
        }
        heroImage.style.transform = `translateY(${window.scrollY * 0.05}px)`;
    });
}

// SCROLL REVEAL ANIMATIONS
const revealSelectors = [
    ".hero-badge",
    ".hero-title",
    ".hero-description",
    ".hero-buttons",
    ".hero-patients",
    ".hero-visual",
    ".stat-item",
    ".about-image-wrapper",
    ".about-content",
    ".service-card",
    ".medicines-content",
    ".medicines-visual",
    ".appointment-container",
    ".contact-content",
    ".contact-form-wrapper"
];

const revealElements = document.querySelectorAll(revealSelectors.join(","));
revealElements.forEach((element, index) => {
    element.classList.add("reveal-on-scroll");
    element.style.transitionDelay = `${Math.min(index % 6, 5) * 0.06}s`;
});
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.14 }
);

revealElements.forEach((element) => revealObserver.observe(element));

// STATS COUNTER ANIMATION
const counters = document.querySelectorAll(".counter");
let counterStarted = false;

const startCounters = () => {
    if (counterStarted) {
        return;
    }

    counterStarted = true;

    counters.forEach((counter) => {
        const target = Number(counter.getAttribute("data-target"));
        const duration = 1300;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(target * easedProgress);

            counter.textContent = value.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };

        requestAnimationFrame(updateCounter);
    });
};

const statsSection = document.querySelector(".stats-section");

if (statsSection) {
    const statsObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    startCounters();
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.3 }
    );

    statsObserver.observe(statsSection);
}

// TESTIMONIAL SLIDER
const testimonialCards = document.querySelectorAll(".testimonial-card");
const testimonialDots = document.querySelectorAll(".testimonial-dot");
const testimonialPrev = document.querySelector(".testimonial-prev");
const testimonialNext = document.querySelector(".testimonial-next");
let activeTestimonial = 0;
let testimonialTimer;

const showTestimonial = (index) => {
    if (!testimonialCards.length) {
        return;
    }

    activeTestimonial =
        (index + testimonialCards.length) % testimonialCards.length;

    testimonialCards.forEach((card, cardIndex) => {
        card.classList.toggle("active", cardIndex === activeTestimonial);
    });

    testimonialDots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === activeTestimonial);
    });
};

const restartTestimonialTimer = () => {
    window.clearInterval(testimonialTimer);
    testimonialTimer = window.setInterval(() => {
        showTestimonial(activeTestimonial + 1);
    }, 5500);
};

if (testimonialCards.length) {
    testimonialPrev?.addEventListener("click", () => {
        showTestimonial(activeTestimonial - 1);
        restartTestimonialTimer();
    });

    testimonialNext?.addEventListener("click", () => {
        showTestimonial(activeTestimonial + 1);
        restartTestimonialTimer();
    });

    testimonialDots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showTestimonial(index);
            restartTestimonialTimer();
        });
    });

    showTestimonial(0);
    restartTestimonialTimer();
}

// ===
// CONTACT FORM FEEDBACK
// ===

const contactForm = document.getElementById("contact-form");
const formMessage = document.getElementById("form-message");

if (contactForm && formMessage) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!contactForm.checkValidity()) {
            formMessage.textContent = "Please complete all required fields.";
            formMessage.className = "form-message error";
            return;
        }

        const submitButton = contactForm.querySelector(".contact-submit");
        const originalButtonContent = submitButton?.innerHTML;
        const formData = new FormData(contactForm);
        const payload = Object.fromEntries(formData.entries());

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML =
                'Sending <i class="fa-solid fa-spinner fa-spin"></i>';
        }

        formMessage.textContent = "Sending your message...";
        formMessage.className = "form-message";

        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: payload.name || "",
                    email: payload.email || "",
                    message: payload.message || ""
                })
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || result.success === false) {
                throw new Error(
                    result.message || "Unable to send your message right now."
                );
            }

            formMessage.textContent =
                result.message ||
                "Thank you. Your message has been received and our team will contact you soon.";
            formMessage.className = "form-message success";
            contactForm.reset();
        } catch (error) {
            formMessage.textContent =
                error.message ||
                "Something went wrong. Please try again in a moment.";
            formMessage.className = "form-message error";
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonContent;
            }
        }
    });
}
// IMAGE FALLBACKS
document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
        image.style.display = "none";
        image.parentElement?.classList.add("image-fallback");
    });
});

// FOOTER YEAR AND INITIAL STATE
const currentYear = document.getElementById("current-year");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}
updateHeaderState();
setActiveNavigation();