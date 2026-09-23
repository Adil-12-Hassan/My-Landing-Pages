const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        projectCards.forEach(function (card) {
            const category = card.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

const hamburger = document.getElementById('hamburger');
const navbar = document.querySelector('.navbar');
hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    navbar.classList.toggle('open');
});

const navLinks = document.querySelectorAll('.navbar a');
navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        navbar.classList.remove('open');
    });
});

const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.navbar a');
window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;
    sections.forEach(function (section) {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navItems.forEach(function (link) {
                link.classList.remove('active');
            });
            const activeLink = document.querySelector('.navbar a[href="#' + sectionId + '"]');
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
});

const statNumbers = document.querySelectorAll(".stat-number");
const statsObserver = new IntersectionObserver(
    function (entries, observer) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            const stat = entry.target;
            const target = Number(stat.dataset.target);
            let current = 0;
            const increment = Math.max(1, Math.ceil(target / 100));
            const counter = setInterval(function () {
                current += increment;
                if (current >= target) {
                    stat.textContent = target + "+";
                    clearInterval(counter);
                } else {
                    stat.textContent = current;
                }
            }, 20);
            observer.unobserve(stat);
        });
    },
    {
        threshold: 1
    }
);
statNumbers.forEach(function (stat) {
    statsObserver.observe(stat);
});

const websiteUpdaterForm = document.getElementById('websiteUpdaterContactForm');
if (websiteUpdaterForm) {
    websiteUpdaterForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const name = document.getElementById('fullname')?.value?.trim() || '';
        const email = document.getElementById('email')?.value?.trim() || '';
        const message = document.getElementById('message')?.value?.trim() || '';

        if (!name || !email || !message) {
            alert('Please fill in your name, email, and message.');
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, message })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('✅ Message sent successfully.');
                websiteUpdaterForm.reset();
            } else {
                alert('❌ ' + (result.error || 'Failed to send message'));
            }
        } catch (error) {
            console.error(error);
            alert('❌ Server error. Please try again later.');
        }
    });
}

