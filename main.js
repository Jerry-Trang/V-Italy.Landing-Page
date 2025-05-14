document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const form = document.getElementById('contactForm');
  
  if (!form) {
    console.error('Contact form not found');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) {
      console.error('Submit button not found');
      return;
    }
    
    const originalText = submitButton.innerHTML;
    
    try {
      // Get form elements
      const nameInput = form.querySelector('#name');
      const phoneInput = form.querySelector('#phone');
      const emailInput = form.querySelector('#email');

      // Validate form elements exist
      if (!nameInput || !phoneInput || !emailInput ) {
        throw new Error('Required form fields not found');
      }
      
      // Show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = '<div class="loader mx-auto"></div>';
      
      // Get form data
      const formData = {
        name: nameInput.value,
        phone: phoneInput.value,
        email: emailInput.value,
      };
      
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.email ) {
        throw new Error('Please fill in all required fields');
      }
      
      // Emit form data to server
      socket.emit('formSubmission', formData);
      
      // Handle success response
      socket.once('formSubmissionSuccess', (response) => {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'text-green-500 text-center mt-4';
        successMessage.textContent = `${response.message}`;
        form.appendChild(successMessage);
        
        // Reset form
        form.reset();
        
        // Reset button
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
          
          // Remove success message after 5 seconds
          setTimeout(() => {
            successMessage.remove();
          }, 5000);
        }, 1500);
      });
      
      // Handle error response
      socket.once('formSubmissionError', (error) => {
        throw new Error(error.message);
      });
      
    } catch (error) {
      console.error('Error:', error);
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'text-red-500 text-center mt-4';
      errorMessage.textContent = error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau!';
      form.appendChild(errorMessage);
      
      setTimeout(() => {
        errorMessage.remove();
      }, 5000);
    }
  });
});

    document.addEventListener('DOMContentLoaded', () => {
      // Initialize AOS
      AOS.init({
        duration: 1000,
        once: false,
        offset: 100,
        anchorPlacement: 'top-bottom',
      });

      // Smooth scrolling for anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const href = this.getAttribute('href');
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      // Sticky Navbar
      const navbar = document.querySelector('.navbar');
      const sticky = navbar.offsetTop;

      window.onscroll = function () {
        if (window.pageYOffset > sticky) {
          navbar.classList.add('sticky');
        } else {
          navbar.classList.remove('sticky');
        }
      };

      // Use IntersectionObserver to hide elements when they exit the viewport
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const element = entry.target;
          if (!entry.isIntersecting) {
            // Remove aos-animate class to hide element when it exits viewport
            element.classList.remove('aos-animate');
          } else {
            // Trigger AOS animation when element enters viewport
            element.classList.add('aos-animate');
          }
        });
      }, {
        root: null, // Use viewport as root
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px' // No margin
      });

      // Observe all elements with data-aos except the navbar
      document.querySelectorAll('[data-aos]').forEach(element => {
        if (!element.closest('.navbar')) {
          observer.observe(element);
        }
      });

      // Form handling
      document.getElementById('contactForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="loader mx-auto"></div>';

        try {
          // Simulate form submission (replace with your actual API call)
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Show success message
          form.classList.add('hidden');
          document.getElementById('successMessage').classList.remove('hidden');

          // Reset form after 5 seconds
          setTimeout(() => {
            form.reset();
            form.classList.remove('hidden');
            document.getElementById('successMessage').classList.add('hidden');
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
          }, 5000);

        } catch (error) {
          console.error('Error submitting form:', error);
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
        }
      });

      const menuButton = document.getElementById('menuButton');
      const mobileMenu = document.getElementById('mobileMenu');
      const menuIcon = document.getElementById('menuIcon');
      let isMenuOpen = false;

      function toggleMenu(show) {
        isMenuOpen = show;
        mobileMenu.classList.toggle('show', show);

        if (show) {
          menuIcon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
          document.body.style.overflow = 'hidden';
        } else {
          menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
          document.body.style.overflow = '';
        }
      }

      // Handle mobile menu item clicks
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          const target = document.querySelector(href);

          // Close menu
          toggleMenu(false);

          // Scroll to section after menu closes
          setTimeout(() => {
            if (target) {
              const targetPosition = target.offsetTop - 80; // Adjust for navbar height
              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });
            }
          }, 500); // Wait for menu close animation
        });
      });

      // Toggle menu on button click
      menuButton.addEventListener('click', () => toggleMenu(!isMenuOpen));

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (isMenuOpen && !mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
          toggleMenu(false);
        }
      });

      // Close menu on resize to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && isMenuOpen) {
          toggleMenu(false);
        }
      });

      // Handle nav tab selection
      const navLinks = document.querySelectorAll('.nav-item input');
      const sections = document.querySelectorAll('section');

      // Update active tab based on scroll position
      window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          if (window.pageYOffset >= sectionTop - 150) {
            current = section.getAttribute('id');
          }
        });

        navLinks.forEach(input => {
          input.checked = input.nextElementSibling.getAttribute('href') === `#${current}`;
        });
      });

      const navBtns = document.querySelectorAll('.nav-btn');
      const sectionsNav = document.querySelectorAll('section');

      function setActiveNav() {
        let current = '';

        sectionsNav.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.clientHeight;
          if (window.scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
          }
        });

        navBtns.forEach(btn => {
          btn.classList.remove('active');
          if (btn.getAttribute('href') === `#${current}`) {
            btn.classList.add('active');
          }
        });
      }

      // Set active on scroll
      window.addEventListener('scroll', setActiveNav);

      // Set active on page load
      setActiveNav();

      // Set active on click
      navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          navBtns.forEach(btn => btn.classList.remove('active'));
          e.currentTarget.classList.add('active');
        });
      });

      // Initialize HeroSlider
      HeroSlider.init();
    });

// Navbar background on scroll
function handleNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  const scrollPosition = window.scrollY;
  const heroHeight = document.querySelector('#home').offsetHeight;

  if (scrollPosition > 0) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// Add scroll event listener
window.addEventListener('scroll', handleNavbarScroll);
// Initial check
handleNavbarScroll();

const HeroSlider = {
  init() {
    this.slides = document.querySelectorAll('.slide');
    this.dots = document.querySelectorAll('.slider-dot');
    this.currentSlide = 0;
    this.slideInterval = 5000; // Change slide every 5 seconds

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.setSlide(index);
      });
    });

    if (this.slides.length > 0) {
      this.startSlideShow();
    }
  },

  setSlide(index) {
    this.slides[this.currentSlide].classList.remove('active');
    this.dots[this.currentSlide].classList.remove('active');
    
    this.currentSlide = index;
    
    this.slides[this.currentSlide].classList.add('active');
    this.dots[this.currentSlide].classList.add('active');
  },

  startSlideShow() {
    setInterval(() => {
      const nextSlide = (this.currentSlide + 1) % this.slides.length;
      this.setSlide(nextSlide);
    }, this.slideInterval);
  }
};
