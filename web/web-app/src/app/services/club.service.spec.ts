import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClubService, Club } from './club.service';
import { environment } from '../../environments/environment';

describe('ClubService', () => {
  let service: ClubService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClubService]
    });
    service = TestBed.inject(ClubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllClubs', () => {
    it('should return clubs array', () => {
      const mockClubs: Club[] = [
        { club_id: '1', name: 'Club 1', website: 'https://club1.com' },
        { club_id: '2', name: 'Club 2', website: 'https://club2.com' }
      ];

      service.getAllClubs().subscribe(clubs => {
        expect(clubs).toEqual(mockClubs);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClubs);
    });

    it('should handle error and return empty array', () => {
      service.getAllClubs().subscribe(clubs => {
        expect(clubs).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getClubById', () => {
    it('should return club by id', () => {
      const mockClub: Club = { club_id: '1', name: 'Test Club', website: 'https://test.com' };

      service.getClubById('1').subscribe(club => {
        expect(club).toEqual(mockClub);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClub);
    });

    it('should handle error and return null', () => {
      service.getClubById('1').subscribe(club => {
        expect(club).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs/1`);
      req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createClub', () => {
    it('should create new club', () => {
      const newClub: Club = { name: 'New Club', website: 'https://newclub.com' };
      const createdClub: Club = { club_id: '1', ...newClub };

      service.createClub(newClub).subscribe(club => {
        expect(club).toEqual(createdClub);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newClub);
      req.flush(createdClub);
    });

    it('should handle error and return null', () => {
      const newClub: Club = { name: 'New Club' };

      service.createClub(newClub).subscribe(club => {
        expect(club).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs`);
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateClub', () => {
    it('should update existing club', () => {
      const updatedClub: Club = { club_id: '1', name: 'Updated Club', website: 'https://updated.com' };

      service.updateClub('1', updatedClub).subscribe(club => {
        expect(club).toEqual(updatedClub);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedClub);
      req.flush(updatedClub);
    });

    it('should handle error and return null', () => {
      const updatedClub: Club = { club_id: '1', name: 'Updated Club' };

      service.updateClub('1', updatedClub).subscribe(club => {
        expect(club).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs/1`);
      req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteClub', () => {
    it('should delete club and return true', () => {
      service.deleteClub('1').subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle error and return false', () => {
      service.deleteClub('1').subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs/1`);
      req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const healthStatus = 'Service is healthy';

      service.healthCheck().subscribe(status => {
        expect(status).toBe(healthStatus);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs/health`);
      expect(req.request.method).toBe('GET');
      req.flush(healthStatus);
    });

    it('should handle error and return default message', () => {
      service.healthCheck().subscribe(status => {
        expect(status).toBe('Service unavailable');
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/clubs/health`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
