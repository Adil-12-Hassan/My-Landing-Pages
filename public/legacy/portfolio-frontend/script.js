// Navbar
const navbar = document.querySelector('.navbar');
const contactBtn = document.querySelector('.contact-btn')

// Nav Links
const navLinks = document.querySelectorAll('.nav-links a');

// Sections
const heroSection = document.getElementById('hero');
const aboutSection = document.getElementById('about');
const servicesSection = document.getElementById('services');
const blogSection = document.getElementById('blog');
const contactSection = document.getElementById('contact');

// Hero
const cvBtn = document.querySelector('.cv-btn');
const heroTag = document.querySelector('.hero .tag');
const heroHeading = document.querySelector('.hero-content h1');

// About
const aboutImage = document.querySelector('.about-image img');
const aboutHeading = document.querySelector('.about-content h2');

// Service Cards
const serviceCards = document.querySelectorAll('.service-card');

// Blog Cards
const blogCards = document.querySelectorAll('.blog-card');

// Contact Form
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const messageInput = document.getElementById('messageInput');

// Footer
const footerLinks = document.querySelectorAll('.footer-links a');
const footerBottom = document.querySelector('.footer-bottom');

// Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navLinks');

// Navbar Scroll Effect
window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
        navbar.style.borderBottom = '1px solid #00d1b2';
        navbar.style.backgroundColor = '#050505';
        navbar.style.transition = 'all 0.3s ease';
    } else {
        navbar.style.borderBottom = 'none';
        navbar.style.backgroundColor = '#0a0a0a'
    }
});

// Smooth Scroll
navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Active Nav Link on Scroll 
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', function () {
    let current = '';

    sections.forEach(function (section) {
        const sectionTop = section.offsetTop - 80;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(function (link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Contact Button Scroll
contactBtn.addEventListener('click', function () {
    contactSection.scrollIntoView({ behavior: 'smooth' });
});

// Close Menu when a link clicked
navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
        hamburger.classList.remove('active')
        navMenu.classList.remove('open');
    });
});

// Close menu when clicking outside
document.addEventListener('click', function (e) {
    const clickedOutside = !navbar.contains(e.target);
    if (clickedOutside) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open')
    }
});

hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
});

// Form Validation + Backend Submit
contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // Check Empty
    if (name === '' || email === '' || message === '') {
        alert('⚠️ Please fill in all fields!');
        return;
    }

    // Email Format Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('⚠️ Please enter valid Email address!');
        return;
    }

    // Name Length Check
    if (name.length < 3) {
        alert('⚠️ Name must be at least 3 characters!');
        return;
    }

    // Message Length Check
    if (message.length < 10) {
        alert('⚠️ Message must be at least 10 characters!');
        return;
    }

    // Send to Backend
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('✅ Message Successfully Sent! I will get back to you soon.');
            nameInput.value = '';
            emailInput.value = '';
            messageInput.value = '';
        } else {
            alert('❌ Failed: ' + (data.error || 'Unable to send message'));
        }
    } catch (error) {
        alert('❌ Server error. Please try again later.');
    }
});