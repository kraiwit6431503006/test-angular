import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private storageKey = 'favorites';

  private favorites = signal<number[]>(this.loadFromStorage());

  constructor() {
    this.saveToStorage();
  }

  private loadFromStorage(): number[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.favorites()));
  }

  getFavorites = computed(() => this.favorites());

  isFavorite(id: number): boolean {
    return this.favorites().includes(id);
  }

  toggleFavorite(id: number) {
    if (this.isFavorite(id)) {
      this.favorites.update(favs => favs.filter(f => f !== id));
    } else {
      this.favorites.update(favs => [...favs, id]);
    }

    this.saveToStorage();
  }

  clear() {
    this.favorites.set([]);
    this.saveToStorage();
  }
}
