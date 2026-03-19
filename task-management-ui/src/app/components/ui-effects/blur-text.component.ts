import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blur-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="blur-text-container" [class.animate]="triggered">
      <span *ngFor="let char of chars; let i = index" 
            class="blur-char" 
            [style.animation-delay]="i * 0.05 + 's'">
        {{char === ' ' ? '&nbsp;' : char}}
      </span>
    </span>
  `,
  styles: [`
    .blur-text-container {
      display: inline-flex;
      flex-wrap: wrap;
    }

    .blur-char {
      display: inline-block;
      filter: blur(10px);
      opacity: 0;
      transform: translateY(10px);
      animation: reveal 0.8s forwards cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    @keyframes reveal {
      to {
        filter: blur(0);
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class BlurTextComponent {
  @Input() text: string = '';
  chars: string[] = [];
  triggered: boolean = true;

  ngOnChanges() {
    this.chars = this.text.split('');
  }
}
 