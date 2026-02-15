import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private storageKey = 'theme';

  isDark = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem(this.storageKey);

    if (saved === 'dark') {
      this.enableDark();
    } else {
      this.disableDark();
    }
  }

  toggle() {
    this.isDark() ? this.disableDark() : this.enableDark();
  }

  private enableDark() {
    document.documentElement.classList.add('dark');
    localStorage.setItem(this.storageKey, 'dark');
    this.isDark.set(true);
  }

  private disableDark() {
    document.documentElement.classList.remove('dark');
    localStorage.setItem(this.storageKey, 'light');
    this.isDark.set(false);
  }
}
