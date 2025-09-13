/* ==========================================================================
   Core Application JavaScript - Main App Controller
   ========================================================================== */

/**
 * The Ascent Platform - Main Application
 * Handles initialization, state management, and core functionality
 */
class AscentApp {
  constructor() {
    this.config = {
      apiBaseUrl: '/api',
      version: '1.0.0',
      environment: 'production'
    };
    
    this.state = {
      user: null,
      currentStage: null,
      isAuthenticated: false,
      theme: 'light',
      notifications: []
    };
    
    this.modules = new Map();
    this.eventBus = new EventTarget();
    
    this.init();
  }
  
  /**
   * Initialize the application
   */
  async init() {
    try {
      this.setupEventListeners();
      this.initializeModules();
      this.loadUserState();
      this.setupIntersectionObserver();
      this.handleRouting();
      
      console.log('🏔️ The Ascent Platform initialized successfully');
    } catch (error) {
      console.error('Failed to initialize The Ascent Platform:', error);
      this.handleError(error);
    }
  }
  
  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.onPageVisible();
      } else {
        this.onPageHidden();
      }
    });
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
      this.handleRouting();
    });
    
    // Handle scroll events for progress tracking
    window.addEventListener('scroll', this.throttle(() => {
      this.updateScrollProgress();
    }, 100));
    
    // Handle resize events
    window.addEventListener('resize', this.debounce(() => {
      this.onWindowResize();
    }, 250));
    
    // Handle form submissions
    document.addEventListener('submit', (event) => {
      if (event.target.matches('[data-form]')) {
        this.handleFormSubmission(event);
      }
    });
    
    // Handle button clicks
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-action]')) {
        this.handleActionClick(event);
      }
    });
  }
  
  /**
   * Initialize application modules
   */
  initializeModules() {
    // Initialize navigation module
    if (window.NavigationModule) {
      this.modules.set('navigation', new NavigationModule());
    }
    
    // Initialize mountain progress module
    if (window.MountainProgressModule) {
      this.modules.set('mountainProgress', new MountainProgressModule());
    }
    
    // Initialize analytics if enabled
    this.initializeAnalytics();
  }
  
  /**
   * Setup Intersection Observer for animations
   */
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerElementAnimation(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll(
      '.stage-card, .feature-card, .pricing-card, .animate-on-scroll'
    );
    
    animatedElements.forEach(element => {
      this.intersectionObserver.observe(element);
    });
  }
  
  /**
   * Trigger animation for an element
   */
  triggerElementAnimation(element) {
    if (!element.classList.contains('animate')) {
      element.classList.add('animate');
      
      // Emit animation event
      this.emit('elementAnimated', { element });
    }
  }
  
  /**
   * Load user state from localStorage or API
   */
  async loadUserState() {
    try {
      // Try to load from localStorage first
      const savedState = localStorage.getItem('ascentUserState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.setState(parsedState);
      }
      
      // Check authentication status
      await this.checkAuthenticationStatus();
      
    } catch (error) {
      console.warn('Failed to load user state:', error);
    }
  }
  
  /**
   * Check if user is authenticated
   */
  async checkAuthenticationStatus() {
    try {
      const response = await this.apiCall('/auth/status');
      if (response.authenticated) {
        this.setState({
          isAuthenticated: true,
          user: response.user,
          currentStage: response.user.currentStage
        });
      }
    } catch (error) {
      // User is not authenticated, which is fine
      console.log('User not authenticated');
    }
  }
  
  /**
   * Handle routing and page navigation
   */
  handleRouting() {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Track page view
    this.trackPageView(path);
    
    // Handle specific routes
    switch (path) {
      case '/':
        this.handleHomePage();
        break;
      case '/dashboard':
        this.handleDashboard();
        break;
      default:
        this.handleGenericPage(path);
    }
  }
  
  /**
   * Handle home page specific functionality
   */
  handleHomePage() {
    // Initialize home page specific features
    this.setupScrollToSection();
    this.initializeHeroAnimations();
  }
  
  /**
   * Setup smooth scrolling to sections
   */
  setupScrollToSection() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
  
  /**
   * Initialize hero section animations
   */
  initializeHeroAnimations() {
    // Add staggered fade-in animations
    const heroElements = document.querySelectorAll('.hero-content > *');
    heroElements.forEach((element, index) => {
      element.style.animationDelay = `${index * 0.2}s`;
      element.classList.add('fade-in');
    });
    
    // Trigger animations after a short delay
    setTimeout(() => {
      heroElements.forEach(element => {
        element.classList.add('visible');
      });
    }, 500);
  }
  
  /**
   * Update scroll progress for navigation and other elements
   */
  updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = (scrollTop / documentHeight) * 100;
    
    // Update progress indicators
    const progressElements = document.querySelectorAll('[data-scroll-progress]');
    progressElements.forEach(element => {
      element.style.setProperty('--scroll-progress', `${scrollPercentage}%`);
    });
    
    // Show/hide back to top button
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
      if (scrollTop > 500) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    }
    
    // Emit scroll progress event
    this.emit('scrollProgress', { scrollPercentage, scrollTop });
  }
  
  /**
   * Handle form submissions
   */
  async handleFormSubmission(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const formType = form.dataset.form;
    
    try {
      // Add loading state
      form.classList.add('loading');
      
      // Handle different form types
      switch (formType) {
        case 'newsletter':
          await this.handleNewsletterSignup(formData);
          break;
        case 'contact':
          await this.handleContactForm(formData);
          break;
        case 'login':
          await this.handleLogin(formData);
          break;
        case 'register':
          await this.handleRegistration(formData);
          break;
        default:
          throw new Error(`Unknown form type: ${formType}`);
      }
      
      // Show success message
      this.showNotification('Form submitted successfully!', 'success');
      
    } catch (error) {
      this.showNotification(error.message, 'error');
    } finally {
      form.classList.remove('loading');
    }
  }
  
  /**
   * Handle action button clicks
   */
  async handleActionClick(event) {
    const button = event.target;
    const action = button.dataset.action;
    
    try {
      button.classList.add('loading');
      
      switch (action) {
        case 'back-to-top':
          this.scrollToTop();
          break;
        case 'toggle-theme':
          this.toggleTheme();
          break;
        case 'start-journey':
          await this.startUserJourney();
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
      
    } catch (error) {
      this.showNotification(error.message, 'error');
    } finally {
      button.classList.remove('loading');
    }
  }
  
  /**
   * Scroll to top of page
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  /**
   * Toggle theme between light and dark
   */
  toggleTheme() {
    const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
    this.setState({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ascentTheme', newTheme);
  }
  
  /**
   * Show notification to user
   */
  showNotification(message, type = 'info', duration = 5000) {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    this.state.notifications.push(notification);
    this.renderNotification(notification);
    
    // Auto-dismiss after duration
    setTimeout(() => {
      this.dismissNotification(notification.id);
    }, duration);
  }
  
  /**
   * Render notification in UI
   */
  renderNotification(notification) {
    const container = this.getNotificationContainer();
    const element = document.createElement('div');
    element.className = `notification notification--${notification.type}`;
    element.dataset.notificationId = notification.id;
    element.innerHTML = `
      <div class="notification__content">
        <p class="notification__message">${notification.message}</p>
        <button class="notification__close" onclick="app.dismissNotification(${notification.id})">×</button>
      </div>
    `;
    
    container.appendChild(element);
    
    // Trigger animation
    requestAnimationFrame(() => {
      element.classList.add('notification--visible');
    });
  }
  
  /**
   * Get or create notification container
   */
  getNotificationContainer() {
    let container = document.querySelector('.notifications-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notifications-container';
      document.body.appendChild(container);
    }
    return container;
  }
  
  /**
   * Dismiss notification
   */
  dismissNotification(notificationId) {
    const element = document.querySelector(`[data-notification-id="${notificationId}"]`);
    if (element) {
      element.classList.remove('notification--visible');
      setTimeout(() => {
        element.remove();
      }, 300);
    }
    
    // Remove from state
    this.state.notifications = this.state.notifications.filter(
      n => n.id !== notificationId
    );
  }
  
  /**
   * Initialize analytics
   */
  initializeAnalytics() {
    // Google Analytics or other analytics initialization
    if (typeof gtag !== 'undefined') {
      this.analyticsEnabled = true;
    }
  }
  
  /**
   * Track page view
   */
  trackPageView(path) {
    if (this.analyticsEnabled && typeof gtag !== 'undefined') {
      gtag('config', 'GA_TRACKING_ID', {
        page_path: path
      });
    }
    
    console.log(`📊 Page view: ${path}`);
  }
  
  /**
   * Track event
   */
  trackEvent(eventName, parameters = {}) {
    if (this.analyticsEnabled && typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
    
    console.log(`📊 Event: ${eventName}`, parameters);
  }
  
  /**
   * Update application state
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.saveUserState();
    this.emit('stateChanged', { state: this.state });
  }
  
  /**
   * Save user state to localStorage
   */
  saveUserState() {
    try {
      const stateToSave = {
        theme: this.state.theme,
        currentStage: this.state.currentStage
      };
      localStorage.setItem('ascentUserState', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save user state:', error);
    }
  }
  
  /**
   * Make API call
   */
  async apiCall(endpoint, options = {}) {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Handle errors gracefully
   */
  handleError(error) {
    console.error('Application Error:', error);
    this.showNotification('An unexpected error occurred. Please try again.', 'error');
    
    // Track error if analytics enabled
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack
    });
  }
  
  /**
   * Emit custom event
   */
  emit(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    this.eventBus.dispatchEvent(event);
    document.dispatchEvent(event);
  }
  
  /**
   * Listen to custom events
   */
  on(eventName, callback) {
    this.eventBus.addEventListener(eventName, callback);
  }
  
  /**
   * Page visibility handlers
   */
  onPageVisible() {
    // Resume any paused operations
    console.log('Page became visible');
  }
  
  onPageHidden() {
    // Pause operations to save resources
    console.log('Page became hidden');
  }
  
  /**
   * Window resize handler
   */
  onWindowResize() {
    // Handle responsive adjustments
    this.emit('windowResize', {
      width: window.innerWidth,
      height: window.innerHeight
    });
  }
  
  /**
   * Utility: Throttle function calls
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
   * Utility: Debounce function calls
   */
  debounce(func, delay) {
    let timeoutId;
    return function() {
      const args = arguments;
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AscentApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AscentApp;
}
