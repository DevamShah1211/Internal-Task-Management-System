import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aurora-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="aurora-container">
      <div class="aurora-blob aurora-blob-1"></div>
      <div class="aurora-blob aurora-blob-2"></div>
      <div class="aurora-blob aurora-blob-3"></div>
      <div class="aurora-blob aurora-blob-4"></div>
      <div class="aurora-blob aurora-blob-5"></div>
      <div class="aurora-blob aurora-blob-6"></div>
    </div>
  `,
  styles: [`
    .aurora-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      z-index: -1;
      opacity: 0.6;
      pointer-events: none;
      filter: blur(100px);
    }

    .aurora-blob {
      position: absolute;
      width: 60vw;
      height: 60vh;
      border-radius: 50%;
      mix-blend-mode: screen;
      animation: aurora-float 20s infinite alternate cubic-bezier(0.45, 0, 0.55, 1);
    }

    .aurora-blob-1 {
      background: rgba(37, 99, 235, 0.4);
      top: -10%;
      left: -10%;
    }

    .aurora-blob-2 {
      background: rgba(147, 51, 234, 0.4);
      bottom: -10%;
      right: -10%;
      animation-delay: -5s;
      animation-duration: 25s;
    }

    .aurora-blob-3 {
      background: rgba(236, 72, 153, 0.3);
      top: 20%;
      right: 10%;
      animation-delay: -10s;
      animation-duration: 30s;
    }

    .aurora-blob-4 {
      background: rgba(16, 185, 129, 0.2);
      bottom: 20%;
      left: 10%;
      animation-delay: -15s;
    }
    
    .aurora-blob-5 {
      background: rgba(245, 158, 11, 0.2);
      top: 40%;
      left: 40%;
      animation-duration: 40s;
    }

    .aurora-blob-6 {
      background: rgba(59, 130, 246, 0.3);
      bottom: 10%;
      left: 30%;
      animation-delay: -7s;
    }

    @keyframes aurora-float {
      0% {
        transform: translate(0, 0) scale(1) rotate(0deg);
      }
      33% {
        transform: translate(5%, 10%) scale(1.1) rotate(5deg);
      }
      66% {
        transform: translate(-5%, 5%) scale(0.9) rotate(-5deg);
      }
      100% {
        transform: translate(0, 0) scale(1) rotate(0deg);
      }
    }
  `]
})
export class AuroraBackgroundComponent {}
 