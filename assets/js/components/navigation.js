/* ==========================================================================
   Navigation Component JavaScript - Mobile Menu and Navigation Behavior
   ========================================================================== */

/**
 * Navigation Module
 * Handles mobile menu toggle, scroll behavior, and navigation interactions
 */
class NavigationModule {
  constructor() {
    this.nav = document.getElementById('mainNav');
    this.navToggle = document.getElementById('navToggle');
    this.navMenu = document.getElementById('navMenu');
    this.navLinks = document.querySelectorAll('.nav-link');
    
    this.isMenuOpen = false;
    this.lastScrollTop = 0;
    this.scrollThreshold = 100;
    
    this.init();
  }
  
  /**
   * Initialize navigation functionality
   */
  init() {
    if (!this.nav) return;
    
    this.setupEventListeners();
    this.setupScrollBehavior();
    this.highlightActiveLink();
    
    console.log('🧭 Navigation module initialized');
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Mobile menu toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }
    
    // Close menu when clicking nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMenuOpen) {
          this.closeMobileMenu();
        }
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (this.isMenuOpen && !this.nav.contains(event.target)) {
        this.closeMobileMenu();
      }
    });
    
    // Handle escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
    
    // Handle scroll for navigation behavior
    window.addEventListener('scroll', this.throttle(() => {
      this.handleScroll();
    }, 16));
    
    // Handle resize to close mobile menu on desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }
  
  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  /**
   * Open mobile menu
   */
  openMobileMenu() {
    this.isMenuOpen = true;
    this.navToggle?.classList.add('active');
    this.navMenu?.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management for accessibility
    this.trapFocus();
    
    // Emit event
    this.emit('mobileMenuOpened');
  }
  
  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    this.isMenuOpen = false;
    this.navToggle?.classList.remove('active');
    this.navMenu?.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to toggle button
    this.navToggle?.focus();
    
    // Emit event
    this.emit('mobileMenuClosed');
  }
  
  /**
   * Setup scroll behavior for navigation
   */
  setupScrollBehavior() {
    // Add scroll progress indicator
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'nav-progress';
    progressIndicator.setAttribute('data-scroll-progress', '');
    this.nav?.appendChild(progressIndicator);
  }
  
  /**
   * Handle scroll events
   */
  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add/remove scrolled class
    if (scrollTop > this.scrollThreshold) {
      this.nav?.classList.add('scrolled');
    } else {
      this.nav?.classList.remove('scrolled');
    }
    
    // Hide/show navigation on scroll (optional)
    if (this.shouldHideOnScroll()) {
      if (scrollTop > this.lastScrollTop && scrollTop > this.scrollThreshold) {
        // Scrolling down
        this.hideNavigation();
      } else {
        // Scrolling up
        this.showNavigation();
      }
    }
    
    this.lastScrollTop = scrollTop;
    
    // Update active link based on scroll position
    this.updateActiveLink();
  }
  
  /**
   * Check if navigation should hide on scroll
   */
  shouldHideOnScroll() {
    return window.innerWidth > 768 && !this.isMenuOpen;
  }
  
  /**
   * Hide navigation
   */
  hideNavigation() {
    if (this.nav && !this.nav.classList.contains('nav-hidden')) {
      this.nav.classList.add('nav-hidden');
      this.nav.style.transform = 'translateY(-100%)';
    }
  }
  
  /**
   * Show navigation
   */
  showNavigation() {
    if (this.nav && this.nav.classList.contains('nav-hidden')) {
      this.nav.classList.remove('nav-hidden');
      this.nav.style.transform = 'translateY(0)';
    }
  }
  
  /**
   * Highlight active navigation link
   */
  highlightActiveLink() {
    const currentPath = window.location.pathname;
    
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Remove active class from all links
      link.classList.remove('active');
      
      // Add active class to current page link
      if (href === currentPath || (currentPath === '/' && href === '/')) {
        link.classList.add('active');
      }
    });
  }
  
  /**
   * Update active link based on scroll position
   */
  updateActiveLink() {
    if (window.location.pathname !== '/') return;
    
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.pageYOffset + 100; // Offset for header height
    
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });
    
    // Update navigation links
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('active');
      
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }
  
  /**
   * Trap focus within mobile menu for accessibility
   */
  trapFocus() {
    if (!this.navMenu) return;
    
    const focusableElements = this.navMenu.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    // Focus first element
    firstFocusable.focus();
    
    // Handle tab key
    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return;
      
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };
    
    // Add event listener
    document.addEventListener('keydown', handleTabKey);
    
    // Remove event listener when menu closes
    const cleanup = () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('mobileMenuClosed', cleanup);
    };
    
    document.addEventListener('mobileMenuClosed', cleanup);
  }
  
  /**
   * Add dropdown functionality (for future use)
   */
  setupDropdowns() {
    const dropdowns = this.nav?.querySelectorAll('.nav-dropdown');
    
    dropdowns?.forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav-link');
      const menu = dropdown.querySelector('.nav-dropdown-menu');
      
      if (!trigger || !menu) return;
      
      // Mouse events
      dropdown.addEventListener('mouseenter', () => {
        this.showDropdown(menu);
      });
      
      dropdown.addEventListener('mouseleave', () => {
        this.hideDropdown(menu);
      });
      
      // Keyboard events
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.toggleDropdown(menu);
        }
      });
    });
  }
  
  /**
   * Show dropdown menu
   */
  showDropdown(menu) {
    menu.style.opacity = '1';
    menu.style.visibility = 'visible';
    menu.style.transform = 'translateY(0)';
  }
  
  /**
   * Hide dropdown menu
   */
  hideDropdown(menu) {
    menu.style.opacity = '0';
    menu.style.visibility = 'hidden';
    menu.style.transform = 'translateY(-10px)';
  }
  
  /**
   * Toggle dropdown menu
   */
  toggleDropdown(menu) {
    const isVisible = menu.style.visibility === 'visible';
    
    if (isVisible) {
      this.hideDropdown(menu);
    } else {
      this.showDropdown(menu);
    }
  }
  
  /**
   * Update user avatar (for authenticated users)
   */
  updateUserAvatar(user) {
    const existingAvatar = this.nav?.querySelector('.nav-avatar');
    
    if (user && user.avatar) {
      if (existingAvatar) {
        existingAvatar.src = user.avatar;
        existingAvatar.alt = `${user.name}'s avatar`;
      } else {
        this.createUserAvatar(user);
      }
    } else if (existingAvatar) {
      existingAvatar.remove();
    }
  }
  
  /**
   * Create user avatar element
   */
  createUserAvatar(user) {
    const navMenu = this.nav?.querySelector('.nav-menu');
    if (!navMenu) return;
    
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'nav-user';
    
    const avatar = document.createElement('img');
    avatar.className = 'nav-avatar';
    avatar.src = user.avatar || this.generateAvatarUrl(user.name);
    avatar.alt = `${user.name}'s avatar`;
    
    avatarContainer.appendChild(avatar);
    navMenu.appendChild(avatarContainer);
  }
  
  /**
   * Generate avatar URL from user name
   */
  generateAvatarUrl(name) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=fff&size=64`;
  }
  
  /**
   * Add notification badge
   */
  addNotificationBadge(count) {
    const existingBadge = this.nav?.querySelector('.nav-notification-badge');
    
    if (count > 0) {
      if (existingBadge) {
        existingBadge.textContent = count > 99 ? '99+' : count.toString();
      } else {
        this.createNotificationBadge(count);
      }
    } else if (existingBadge) {
      existingBadge.remove();
    }
  }
  
  /**
   * Create notification badge
   */
  createNotificationBadge(count) {
    const navUser = this.nav?.querySelector('.nav-user');
    if (!navUser) return;
    
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'nav-notification';
    
    const badge = document.createElement('span');
    badge.className = 'nav-notification-badge';
    badge.textContent = count > 99 ? '99+' : count.toString();
    
    notificationContainer.appendChild(badge);
    navUser.appendChild(notificationContainer);
  }
  
  /**
   * Emit custom event
   */
  emit(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }
  
  /**
   * Utility: Throttle function
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  /**
   * Destroy navigation module
   */
  destroy() {
    // Remove event listeners
    this.navToggle?.removeEventListener('click', this.toggleMobileMenu);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    
    // Close mobile menu if open
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    }
    
    console.log('🧭 Navigation module destroyed');
  }
}

// Auto-initialize if not using module system
if (typeof window !== 'undefined') {
  window.NavigationModule = NavigationModule;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationModule;
}
