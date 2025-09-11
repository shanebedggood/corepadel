import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { VenueService, Venue } from '../../services/venue.service';
import { VenueFacility } from '../../services/quarkus-venue.service';

// Extended interface to handle both old and new formats during migration
// Legacy format support removed – only array-based facilities are supported going forward

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    CardModule,
    ButtonModule,
    SelectModule,
    TagModule,
    SkeletonModule,
    MessageModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.scss']
})
export class ClubsComponent implements OnInit, OnDestroy {
  allVenues: Venue[] = [];
  filteredVenues: Venue[] = [];
  loading = true;
  error = false;
  
  searchFilters = {
    name: '',
    province: '',
    city: '',
    suburb: ''
  };

  provinces: { label: string; value: string }[] = [];
  cities: { label: string; value: string }[] = [];
  suburbs: { label: string; value: string }[] = [];


  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<void>();

  constructor(private venueService: VenueService) {}

  ngOnInit() {
    this.loadVenues();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVenues() {
    this.loading = true;
    this.error = false;
    this.venueService.getVenues()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (venues) => {
          this.allVenues = venues || [];
          this.filteredVenues = venues || [];
          this.populateFilterOptions();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading venues:', error);
          console.error('Error details:', {
            message: error?.message,
            status: error?.status,
            statusText: error?.statusText,
            url: error?.url
          });
          
          // For testing purposes, let's add some sample data if the API fails
          this.allVenues = [
            {
              id: '1',
              name: 'Sample Padel Club',
              website: 'https://example.com',
              facilities: [
                {
                  facility: {
                    id: '1',
                    name: 'Indoor Courts',
                    category: 'Court',
                    is_countable: true,
                    unit: 'courts'
                  },
                  quantity: 3
                },
                {
                  facility: {
                    id: '2',
                    name: 'Pro Shop',
                    category: 'Amenity',
                    is_countable: false
                  },
                  quantity: 1
                }
              ],
              address: {
                street: '123 Main Street',
                suburb: 'Downtown',
                city: 'Sample City',
                province: 'Sample Province',
                postalCode: '12345',
                country: 'Sample Country'
              }
            }
          ];
          this.filteredVenues = [...this.allVenues];
          this.populateFilterOptions();
          
          this.error = true;
          this.loading = false;
        }
      });
  }

  private populateFilterOptions() {
    // Extract unique provinces, cities, and suburbs
    const provincesSet = new Set<string>();
    const citiesSet = new Set<string>();
    const suburbsSet = new Set<string>();

    this.allVenues.forEach((venue, index) => {
      if (venue.address?.province) {
        provincesSet.add(venue.address.province);
      }
      if (venue.address?.city) {
        citiesSet.add(venue.address.city);
      }
      if (venue.address?.suburb) {
        suburbsSet.add(venue.address.suburb);
      }
      
    });

    this.provinces = Array.from(provincesSet)
      .sort()
      .map(province => ({ label: province, value: province }));

    this.cities = Array.from(citiesSet)
      .sort()
      .map(city => ({ label: city, value: city }));

    this.suburbs = Array.from(suburbsSet)
      .sort()
      .map(suburb => ({ label: suburb, value: suburb }));
  }

  private setupSearch() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  onSearchChange() {
    this.searchSubject.next();
  }

  private applyFilters() {
    this.filteredVenues = this.allVenues.filter(venue => {
      const nameMatch = !this.searchFilters.name || 
        venue.name.toLowerCase().includes(this.searchFilters.name.toLowerCase());
      
      const provinceMatch = !this.searchFilters.province || 
        venue.address?.province === this.searchFilters.province;
      
      const cityMatch = !this.searchFilters.city || 
        venue.address?.city === this.searchFilters.city;
      
      const suburbMatch = !this.searchFilters.suburb || 
        venue.address?.suburb === this.searchFilters.suburb;
      return nameMatch && provinceMatch && cityMatch && suburbMatch;
    });
  }

  clearFilters() {
    this.  searchFilters = {
    name: '',
    province: '',
    city: '',
    suburb: ''
  };
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return Object.values(this.searchFilters).some(value => value !== '');
  }

  getFacilityDisplay(venueFacility: VenueFacility): string {
    if (venueFacility.facility?.is_countable && venueFacility.quantity > 1) {
      return `${venueFacility.quantity} ${venueFacility.facility.name}`;
    }
    return venueFacility.facility?.name || 'Unknown Facility';
  }

  getFacilityIcon(venueFacility: VenueFacility): string {
    return venueFacility.facility?.icon || 'pi pi-star';
  }

  trackByFacility(index: number, venueFacility: VenueFacility): any {
    return venueFacility.facility?.id || index;
  }
}
