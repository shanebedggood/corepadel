import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule],
    template: `
    <div class="bg-surface-900 py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 md:col-span-2">
            <a (click)="router.navigate(['/pages/landing'], { fragment: 'hero' })" class="flex flex-wrap items-center justify-center md:justify-start md:mb-0 mb-6 cursor-pointer">
              <h4 class="font-medium text-2xl sm:text-3xl text-surface-200 dark:text-surface-0 mt-4">STRIDE & SERVE</h4>
            </a>
          </div>
          <div class="col-span-12 md:col-span-10">
            <div class="grid grid-cols-12 gap-4 sm:gap- text-center md:text-left">
              <div class="col-span-12 md:col-span-3">
                <h4 class="font-medium text-xl sm:text-2xl leading-normal mb-4 sm:mb-6 text-surface-50 dark:text-surface-0">Privacy Policy</h4>
              </div>
              <div class="col-span-12 md:col-span-3">
                <h4 class="font-medium text-xl sm:text-2xl leading-normal mb-4 sm:mb-6 text-surface-50 dark:text-surface-0">Terms of Service</h4>
              </div>
              <div class="col-span-12 md:col-span-3">
                <h4 class="font-medium text-xl sm:text-2xl leading-normal mb-4 sm:mb-6 text-surface-50 dark:text-surface-0">Contact Information</h4>
              </div>
              <div class="col-span-12 md:col-span-3">
                <h4 class="font-medium text-xl sm:text-2xl leading-normal mb-4 sm:mb-6 text-surface-50 dark:text-surface-0">Legal</h4>
              </div>
            </div>
          </div>
        </div>
        <hr class="my-10 border-surface-700">
        <div class="text-center text-surface-400">
          Copyright &copy; 2025
        </div>
      </div>
    </div>
  `
})
export class FooterWidget {
    constructor(public router: Router) { }
}
