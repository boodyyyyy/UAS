import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  isScrolled = false;
  animatedFeatures = false;

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 50;
    
    // Trigger feature cards animation when they come into view
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
      const rect = featuresSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && !this.animatedFeatures) {
        this.animatedFeatures = true;
      }
    }
  }

  ngOnInit() {
    // Trigger initial animations
    setTimeout(() => {
      this.animatedFeatures = true;
    }, 500);
  }
}
