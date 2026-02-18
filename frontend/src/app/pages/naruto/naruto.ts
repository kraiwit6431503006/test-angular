import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { Breadcrumb, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb';
import { HandEffect } from '../../components/hand-effect/hand-effect';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Breadcrumb,HandEffect],
  templateUrl: './naruto.html'
})
export class Naruto  {

  breadcrumbs: BreadcrumbItem[] = [{ label: 'Naruto',icon: 'mdi-star-box' }];
}
