import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private colorSchemeKey = 'taskflow-theme';
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.setTheme(false);
  }

  toggleTheme() {
    // Disabled as dark theme is removed
  }

  private setTheme(isDark: boolean) {
    this.isDarkMode.set(false);
    document.body.classList.remove('dark-theme');
    localStorage.setItem(this.colorSchemeKey, 'light');
  }
}
 