import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { FavoriteService } from '../../services/favorite.service';
import { PostService } from '../../services/post.service';
import { PostCard } from '../../components/post-card/post-card';
import { Breadcrumb } from '../../components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [CommonModule, PostCard, Breadcrumb],
  templateUrl: './favorite.html',
})
export class Favorite {
  constructor(
    public postService: PostService,
    public favoriteService: FavoriteService,
  ) {}

  breadcrumbs = [{ label: 'Home', url: '/' }, { label: 'Favorite' }];

  favoritePosts = computed(() =>
    this.postService.displayPosts().filter((post) => this.favoriteService.isFavorite(post.id)),
  );
}
