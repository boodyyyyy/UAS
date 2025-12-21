import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { ChatWidget } from '../../shared/chat-widget/chat-widget';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar, ChatWidget],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  ngOnInit() {
    // Initialize sidebar width
    document.documentElement.style.setProperty('--sidebar-width', '280px');
  }
}
