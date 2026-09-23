/* ── 1. Active nav link on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.getElementById('mainHeader');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.remove('active'));
            const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
            if (active) active.classList.add('active');
        }
    });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(sec => observer.observe(sec));

/* ── 2. Sticky header shadow on scroll ── */
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── 3. Skill bar animation on scroll ── */
const skillCards = document.querySelectorAll('.skill-card');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const pct = entry.target.dataset.percent;
            const fill = entry.target.querySelector('.skill-bar-fill');
            fill.style.width = pct + '%';
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

skillCards.forEach(card => skillObserver.observe(card));

/* ── 4. Contact form submit ── */
async function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("fullname")?.value?.trim() || "";
    const email = document.getElementById("email")?.value?.trim() || "";
    const message = document.getElementById("message")?.value?.trim() || "";

    if (!name || !email || !message) {
        alert("⚠️ Please fill in your name, email, and message.");
        return;
    }

    try {
        const res = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, message })
        });

        const result = await res.json();

        if (res.ok && result.success) {
            alert("✅ Message sent!");
            document.getElementById("fullname").value = "";
            document.getElementById("email").value = "";
            document.getElementById("message").value = "";
        } else {
            alert("❌ " + (result.error || "Failed to send message"));
        }

    } catch (error) {
        console.error(error);
        alert("⚠️ Server is waking up... try again in 5 seconds");
    }
}

/* ── 5. Placeholder alerts for works in progress ── */
const placeholderDemoLinks = document.querySelectorAll('.work-card .overlay a[title="Live Demo"]');
placeholderDemoLinks.forEach(link => {
    const href = link.getAttribute('href')?.trim();
    if (!href || href === '#') {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Coming soon');
        });
    }
});

/* ── Hamburger toggle ── */
const hamburger = document.getElementById('hamburger');
const navBar = document.getElementById('navBar');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navBar.classList.toggle('open');
});

// Close menu when a nav link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navBar.classList.remove('open');
    });
});