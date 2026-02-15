import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from '../types/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  posts = signal<Post[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  visibleCount = signal<number>(10);
  isLoadingMore = signal<boolean>(false);
  searchTerm = signal<string>('');

  displayPosts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    const filtered = term
      ? this.posts().filter(
          (post) =>
            post.title.toLowerCase().includes(term) || post.body.toLowerCase().includes(term),
        )
      : this.posts();

    return filtered.slice(0, this.visibleCount());
  });

  constructor(private http: HttpClient) {}

  fetchPosts() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Post[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.posts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to fetch posts');
        this.loading.set(false);
      },
    });
  }

  loadMore() {
    if (this.visibleCount() >= this.posts().length) return;

    this.isLoadingMore.set(true);

    setTimeout(() => {
      this.visibleCount.update((v) => v + 10);
      this.isLoadingMore.set(false);
    }, 500);
  }

  getPostById(id: number) {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  setSearch(term: string) {
    this.searchTerm.set(term);
    this.visibleCount.set(10);
  }
}
