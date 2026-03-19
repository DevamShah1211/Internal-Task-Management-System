import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appClickSpark]',
  standalone: true
})
export class ClickSparkDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.createSpark(event.clientX, event.clientY);
  }

  private createSpark(x: number, y: number) {
    const sparkCount = 10;
    const container = document.body;

    for (let i = 0; i < sparkCount; i++) {
      const spark = this.renderer.createElement('div');
      const angle = (i / sparkCount) * Math.PI * 2;
      const distance = 40 + Math.random() * 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      this.renderer.setStyle(spark, 'position', 'fixed');
      this.renderer.setStyle(spark, 'left', `${x}px`);
      this.renderer.setStyle(spark, 'top', `${y}px`);
      this.renderer.setStyle(spark, 'width', '3px');
      this.renderer.setStyle(spark, 'height', '3px');
      this.renderer.setStyle(spark, 'background', 'var(--primary)');
      this.renderer.setStyle(spark, 'border-radius', '50%');
      this.renderer.setStyle(spark, 'pointer-events', 'none');
      this.renderer.setStyle(spark, 'z-index', '99999');
      this.renderer.setStyle(spark, 'opacity', '1');
      this.renderer.setStyle(spark, 'will-change', 'transform, opacity');
      
      this.renderer.appendChild(container, spark);

      const animation = spark.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
      ], {
        duration: 450,
        easing: 'ease-out'
      });

      const removeSpark = () => {
        if (spark.parentNode) {
          this.renderer.removeChild(container, spark);
        }
      };

      animation.onfinish = removeSpark;
      animation.oncancel = removeSpark;
      // Safety cleanup
      setTimeout(removeSpark, 500);
    }

  }

}
 