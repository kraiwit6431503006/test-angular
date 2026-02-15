import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Post } from '../../types/post';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'post-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-card.html',
})
export class PostCard {

  @Input({ required: true }) post!: Post;

  constructor(public favoriteService: FavoriteService) {}

  toggleFavorite(event: Event) {
    event.stopPropagation();
    this.favoriteService.toggleFavorite(this.post.id);
  }
}
