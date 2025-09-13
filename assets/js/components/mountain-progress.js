/* ==========================================================================
   Mountain Progress Component JavaScript - Interactive Mountain Visualization
   ========================================================================== */

/**
 * Mountain Progress Module
 * Handles the interactive mountain visualization showing user journey progress
 */
class MountainProgressModule {
  constructor() {
    this.container = document.getElementById('mountainProgress');
    this.svg = this.container?.querySelector('.mountain-svg');
    this.path = this.svg?.querySelector('.journey-path');
    this.markers = this.svg?.querySelectorAll('.stage-marker');
    
    this.stages = [
      { id: 'start', name: 'Start Your Journey', description: 'Begin your college admissions journey' },
      { id: 'basecamp', name: 'The Basecamp', description: 'Discover your strengths and passions (Grades 6-8)' },
      { id: 'pathfinder', name: 'The Pathfinder', description: 'Begin focused exploration (Grade 9)' },
      { id: 'blueprint', name: 'The Blueprint', description: 'Develop your specialized narrative (Grade 10)' },
      { id: 'launchpad', name: 'The Launchpad', description: 'Create tangible proof points (Grade 11)' },
      { id: 'summit', name: 'The Summit', description: 'Transform preparation into applications (Grade 12)' }
    ];
    
    this.currentStage = 0;
    this.isAnimating = false;
    this.tooltips = new Map();
    
    this.init();
  }
  
  /**
   * Initialize mountain progress functionality
   */
  init() {
    if (!this.container || !this.svg) return;
    
    this.setupEventListeners();
    this.createTooltips();
    this.animateInitialState();
    this.updateProgress();
    
    console.log('🏔️ Mountain Progress module initialized');
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Marker hover events
    this.markers?.forEach((marker, index) => {
      marker.addEventListener('mouseenter', () => {
        this.showTooltip(index);
      });
      
      marker.addEventListener('mouseleave', () => {
        this.hideTooltip(index);
      });
      
      marker.addEventListener('click', () => {
        this.handleMarkerClick(index);
      });
      
      // Keyboard support
      marker.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.handleMarkerClick(index);
        }
      });
      
      // Make markers focusable
      marker.setAttribute('tabindex', '0');
      marker.setAttribute('role', 'button');
      marker.setAttribute('aria-label', this.stages[index]?.name || 'Stage marker');
    });
    
    // Listen for user progress updates
    document.addEventListener('userProgressUpdated', (event) => {
      const { currentStage } = event.detail;
      this.updateUserProgress(currentStage);
    });
    
    // Listen for window resize
    window.addEventListener('resize', this.debounce(() => {
      this.updateTooltipPositions();
    }, 250));
    
    // Listen for reduced motion preference
    if (this.prefersReducedMotion()) {
      this.disableAnimations();
    }
  }
  
  /**
   * Create tooltips for stage markers
   */
  createTooltips() {
    this.stages.forEach((stage, index) => {
      const tooltip = document.createElement('div');
      tooltip.className = 'mountain-tooltip';
      tooltip.innerHTML = `
        <div class="tooltip-header">
          <h4 class="tooltip-title">${stage.name}</h4>
        </div>
        <div class="tooltip-body">
          <p class="tooltip-description">${stage.description}</p>
        </div>
      `;
      
      this.container.appendChild(tooltip);
      this.tooltips.set(index, tooltip);
    });
  }
  
  /**
   * Show tooltip for stage marker
   */
  showTooltip(stageIndex) {
    const tooltip = this.tooltips.get(stageIndex);
    const marker = this.markers[stageIndex];
    
    if (!tooltip || !marker) return;
    
    // Position tooltip
    this.positionTooltip(tooltip, marker);
    
    // Show tooltip
    tooltip.classList.add('visible');
    
    // Add hover effect to marker
    marker.classList.add('hovered');
  }
  
  /**
   * Hide tooltip for stage marker
   */
  hideTooltip(stageIndex) {
    const tooltip = this.tooltips.get(stageIndex);
    const marker = this.markers[stageIndex];
    
    if (!tooltip || !marker) return;
    
    // Hide tooltip
    tooltip.classList.remove('visible');
    
    // Remove hover effect from marker
    marker.classList.remove('hovered');
  }
  
  /**
   * Position tooltip relative to marker
   */
  positionTooltip(tooltip, marker) {
    const containerRect = this.container.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    
    const tooltipWidth = 250; // Fixed width for consistency
    const tooltipHeight = tooltip.offsetHeight || 80;
    
    // Calculate position relative to container
    const markerX = markerRect.left - containerRect.left + (markerRect.width / 2);
    const markerY = markerRect.top - containerRect.top;
    
    // Position above marker by default
    let x = markerX - (tooltipWidth / 2);
    let y = markerY - tooltipHeight - 15;
    
    // Adjust if tooltip would go outside container
    if (x < 10) x = 10;
    if (x + tooltipWidth > containerRect.width - 10) {
      x = containerRect.width - tooltipWidth - 10;
    }
    
    // If tooltip would go above container, position below marker
    if (y < 0) {
      y = markerY + markerRect.height + 15;
      tooltip.classList.add('below');
    } else {
      tooltip.classList.remove('below');
    }
    
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }
  
  /**
   * Update tooltip positions on resize
   */
  updateTooltipPositions() {
    this.tooltips.forEach((tooltip, index) => {
      if (tooltip.classList.contains('visible')) {
        const marker = this.markers[index];
        if (marker) {
          this.positionTooltip(tooltip, marker);
        }
      }
    });
  }
  
  /**
   * Handle marker click
   */
  handleMarkerClick(stageIndex) {
    const stage = this.stages[stageIndex];
    if (!stage) return;
    
    // Emit event for stage selection
    this.emit('stageSelected', {
      stageIndex,
      stage,
      currentStage: this.currentStage
    });
    
    // Navigate to stage page if it exists
    if (stage.id !== 'start') {
      const stageUrl = `/pages/stages/${stage.id}/index.html`;
      // Check if we should navigate immediately or show preview
      this.handleStageNavigation(stage.id, stageUrl);
    }
    
    // Track analytics
    this.trackStageInteraction(stage.id);
  }
  
  /**
   * Handle stage navigation
   */
  handleStageNavigation(stageId, url) {
    // For demo purposes, we'll just log the navigation
    console.log(`Navigating to stage: ${stageId}`);
    
    // In a real application, you might:
    // - Show a stage preview modal
    // - Navigate to the stage page
    // - Update the current view
    
    // Example navigation (uncomment for actual navigation):
    // window.location.href = url;
  }
  
  /**
   * Animate initial state
   */
  animateInitialState() {
    if (this.prefersReducedMotion()) return;
    
    // Animate path drawing
    if (this.path) {
      const pathLength = this.path.getTotalLength();
      this.path.style.strokeDasharray = pathLength;
      this.path.style.strokeDashoffset = pathLength;
      
      // Trigger animation
      setTimeout(() => {
        this.path.style.transition = 'stroke-dashoffset 3s ease-in-out';
        this.path.style.strokeDashoffset = '0';
      }, 500);
    }
    
    // Animate markers appearing
    this.markers?.forEach((marker, index) => {
      marker.style.opacity = '0';
      marker.style.transform = 'scale(0)';
      
      setTimeout(() => {
        marker.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        marker.style.opacity = '1';
        marker.style.transform = 'scale(1)';
      }, 800 + (index * 200));
    });
  }
  
  /**
   * Update progress based on user's current stage
   */
  updateProgress(userStage = 0) {
    this.currentStage = userStage;
    
    this.markers?.forEach((marker, index) => {
      marker.classList.remove('active', 'completed');
      
      if (index < this.currentStage) {
        marker.classList.add('completed');
      } else if (index === this.currentStage) {
        marker.classList.add('active');
      }
    });
    
    // Update path progress
    this.updatePathProgress();
    
    // Emit progress update event
    this.emit('progressUpdated', {
      currentStage: this.currentStage,
      totalStages: this.stages.length
    });
  }
  
  /**
   * Update path progress visualization
   */
  updatePathProgress() {
    if (!this.path || this.prefersReducedMotion()) return;
    
    const pathLength = this.path.getTotalLength();
    const progressPercentage = this.currentStage / (this.stages.length - 1);
    const progressLength = pathLength * progressPercentage;
    
    // Create or update progress overlay
    let progressPath = this.svg.querySelector('.journey-path-progress');
    if (!progressPath) {
      progressPath = this.path.cloneNode();
      progressPath.classList.remove('journey-path');
      progressPath.classList.add('journey-path-progress');
      progressPath.style.stroke = 'var(--color-accent)';
      progressPath.style.strokeWidth = '5';
      progressPath.style.filter = 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.6))';
      this.svg.appendChild(progressPath);
    }
    
    progressPath.style.strokeDasharray = pathLength;
    progressPath.style.strokeDashoffset = pathLength - progressLength;
  }
  
  /**
   * Update user progress from external source
   */
  updateUserProgress(stage) {
    if (typeof stage === 'string') {
      const stageIndex = this.stages.findIndex(s => s.id === stage);
      if (stageIndex !== -1) {
        this.updateProgress(stageIndex);
      }
    } else if (typeof stage === 'number') {
      this.updateProgress(stage);
    }
  }
  
  /**
   * Animate to specific stage
   */
  animateToStage(targetStage) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    const startStage = this.currentStage;
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentStage = startStage + (targetStage - startStage) * easeOut;
      this.updateProgress(Math.round(currentStage));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        this.updateProgress(targetStage);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * Add pulsing effect to current stage marker
   */
  addPulseEffect() {
    if (this.prefersReducedMotion()) return;
    
    const currentMarker = this.markers[this.currentStage];
    if (currentMarker) {
      currentMarker.classList.add('pulse');
    }
  }
  
  /**
   * Remove pulsing effect from all markers
   */
  removePulseEffect() {
    this.markers?.forEach(marker => {
      marker.classList.remove('pulse');
    });
  }
  
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  /**
   * Disable animations for reduced motion
   */
  disableAnimations() {
    this.svg?.classList.add('no-animations');
    
    // Remove animation classes
    this.markers?.forEach(marker => {
      marker.style.transition = 'none';
    });
    
    if (this.path) {
      this.path.style.transition = 'none';
    }
  }
  
  /**
   * Track stage interaction for analytics
   */
  trackStageInteraction(stageId) {
    if (window.app && window.app.trackEvent) {
      window.app.trackEvent('stage_marker_clicked', {
        stage_id: stageId,
        current_stage: this.currentStage
      });
    }
  }
  
  /**
   * Get current progress as percentage
   */
  getProgressPercentage() {
    return (this.currentStage / (this.stages.length - 1)) * 100;
  }
  
  /**
   * Get stage information
   */
  getStageInfo(stageIndex) {
    return this.stages[stageIndex] || null;
  }
  
  /**
   * Reset progress to beginning
   */
  reset() {
    this.updateProgress(0);
    this.removePulseEffect();
  }
  
  /**
   * Emit custom event
   */
  emit(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }
  
  /**
   * Utility: Debounce function
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
  
  /**
   * Destroy mountain progress module
   */
  destroy() {
    // Remove event listeners
    this.markers?.forEach(marker => {
      marker.removeEventListener('mouseenter', this.showTooltip);
      marker.removeEventListener('mouseleave', this.hideTooltip);
      marker.removeEventListener('click', this.handleMarkerClick);
    });
    
    // Remove tooltips
    this.tooltips.forEach(tooltip => {
      tooltip.remove();
    });
    this.tooltips.clear();
    
    console.log('🏔️ Mountain Progress module destroyed');
  }
}

// Auto-initialize if not using module system
if (typeof window !== 'undefined') {
  window.MountainProgressModule = MountainProgressModule;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MountainProgressModule;
}
