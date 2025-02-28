class BeamsBackground {
    constructor(options = {}) {
      this.intensity = options.intensity || 'strong';
      this.canvasElement = null;
      this.ctx = null;
      this.beams = [];
      this.animationFrameId = null;
      this.MINIMUM_BEAMS = 20;
      
      this.opacityMap = {
        subtle: 0.7,
        medium: 0.85,
        strong: 1,
      };
      
      this.init();
    }
    
    init() {
      // Create container elements
      this.container = document.createElement('div');
      this.container.className = 'beams-container';
      
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'beams-canvas';
      
      this.overlay = document.createElement('div');
      this.overlay.className = 'beams-overlay';
      
      // Append to DOM
      this.container.appendChild(this.canvas);
      this.container.appendChild(this.overlay);
      document.body.prepend(this.container);
      
      // Get context
      this.ctx = this.canvas.getContext('2d');
      
      // Initialize canvas and start animation
      this.updateCanvasSize();
      window.addEventListener('resize', this.updateCanvasSize.bind(this));
      this.animate();
    }
    
    updateCanvasSize() {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.canvas.style.width = `${window.innerWidth}px`;
      this.canvas.style.height = `${window.innerHeight}px`;
      
      if (this.ctx) {
        this.ctx.scale(dpr, dpr);
      }
      
      // Create beams
      const totalBeams = this.MINIMUM_BEAMS * 1.5;
      this.beams = Array.from({ length: totalBeams }, () => 
        this.createBeam(this.canvas.width, this.canvas.height)
      );
    }
    
    createBeam(width, height) {
      const angle = -35 + Math.random() * 10;
      return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2.5,
        angle: angle,
        speed: 0.6 + Math.random() * 1.2,
        opacity: 0.12 + Math.random() * 0.16,
        hue: 190 + Math.random() * 70,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      };
    }
    
    resetBeam(beam, index, totalBeams) {
      if (!this.canvas) return beam;
      
      const column = index % 3;
      const spacing = this.canvas.width / 3;
      
      beam.y = this.canvas.height + 100;
      beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = 190 + (index * 70) / totalBeams;
      beam.opacity = 0.2 + Math.random() * 0.1;
      
      return beam;
    }
    
    drawBeam(beam) {
      this.ctx.save();
      this.ctx.translate(beam.x, beam.y);
      this.ctx.rotate((beam.angle * Math.PI) / 180);
      
      // Calculate pulsing opacity
      const pulsingOpacity = beam.opacity * 
        (0.8 + Math.sin(beam.pulse) * 0.2) * 
        this.opacityMap[this.intensity];
      
      const gradient = this.ctx.createLinearGradient(0, 0, 0, beam.length);
      
      // Enhanced gradient with multiple color stops
      gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
      gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      this.ctx.restore();
    }
    
    animate() {
      if (!this.canvas || !this.ctx) return;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.filter = 'blur(35px)';
      
      const totalBeams = this.beams.length;
      this.beams.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        
        // Reset beam when it goes off screen
        if (beam.y + beam.length < -100) {
          this.resetBeam(beam, index, totalBeams);
        }
        
        this.drawBeam(beam);
      });
      
      this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
    
    setIntensity(intensity) {
      if (this.opacityMap[intensity]) {
        this.intensity = intensity;
      }
    }
    
    destroy() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      window.removeEventListener('resize', this.updateCanvasSize);
      
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }
  }
  
  // Initialize the background when the document is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const beamsBackground = new BeamsBackground({
      intensity: 'strong' // 'subtle', 'medium', or 'strong'
    });
    
    // Make it accessible globally if needed
    window.beamsBackground = beamsBackground;
  });