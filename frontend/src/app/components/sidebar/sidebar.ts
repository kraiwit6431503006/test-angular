import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  @Input() isOpen = false;

  close() {
    this.isOpen = false;
  }
}
