import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { PostService } from '../../services/post.service';
import { FavoriteService } from '../../services/favorite.service';
import { RouterModule } from '@angular/router';
import { PostCard } from '../../components/post-card/post-card';
import { Breadcrumb, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, PostCard, Breadcrumb],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  constructor(
    public postService: PostService,
    public favoriteService: FavoriteService,
  ) {}

  breadcrumbs: BreadcrumbItem[] = [{ label: 'Home' }];

  ngOnInit() {
    this.postService.fetchPosts();
  }

  onScroll(event: any) {
    const element = event.target;

    const threshold = 100;

    if (element.scrollTop + element.clientHeight >= element.scrollHeight - threshold) {
      this.postService.loadMore();
    }
  }

  onSearch(event: any) {
    this.postService.setSearch(event.target.value);
  }
}
