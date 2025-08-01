import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  template: `
    <div class="layout-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Core Padel</h3>
          <p>Your premier destination for padel tournaments and community.</p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/tournaments">Tournaments</a></li>
            <li><a routerLink="/rules">Rules</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contact</h4>
          <p>Email: info&#64;padel365.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 Padel 365. All rights reserved.</p>
      </div>
    </div>
  `,
  styles: [`
    .layout-footer {
      background-color: #1e293b;
      color: #f8fafc;
      padding: 2rem 0;
      margin-top: auto;
    }
    
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }
    
    .footer-section h3 {
      color: #fbbf24;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
    
    .footer-section h4 {
      color: #fbbf24;
      margin-bottom: 0.75rem;
      font-size: 1.1rem;
    }
    
    .footer-section p {
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }
    
    .footer-section ul {
      list-style: none;
      padding: 0;
    }
    
    .footer-section ul li {
      margin-bottom: 0.5rem;
    }
    
    .footer-section ul li a {
      color: #f8fafc;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    
    .footer-section ul li a:hover {
      color: #fbbf24;
    }
    
    .footer-bottom {
      border-top: 1px solid #334155;
      margin-top: 2rem;
      padding-top: 1rem;
      text-align: center;
    }
    
    .footer-bottom p {
      margin: 0;
      color: #94a3b8;
    }
  `]
})
export class AppFooter {
}
