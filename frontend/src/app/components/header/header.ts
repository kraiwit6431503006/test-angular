import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './header.html',
})
export class HeaderComponent{
  constructor(public theme: ThemeService) {}

  @Output() menuClick = new EventEmitter<void>();

  isDark = false;

  toggleSidebar() {
    this.menuClick.emit();
  }

  toggleDark() {
    this.theme.toggle();
  }
}
