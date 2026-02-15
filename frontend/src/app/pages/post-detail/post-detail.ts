import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';
import { FavoriteService } from '../../services/favorite.service';
import { Post } from '../../types/post';
import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, Breadcrumb],
  templateUrl: './post-detail.html',
})
export class PostDetail implements OnInit {
  private route = inject(ActivatedRoute);

  post = signal<Post | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  postId = this.route.snapshot.paramMap.get('id');
  breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Post', url: '/' },
    { label: `#${this.postId}` },
  ];

  constructor(
    private postService: PostService,
    public favoriteService: FavoriteService,
  ) {}

  ngOnInit() {
    const id = Number(this.postId);

    this.postService.getPostById(id).subscribe({
      next: (data) => {
        this.post.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Post not found');
        this.loading.set(false);
      },
    });
  }
}
