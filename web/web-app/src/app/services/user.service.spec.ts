import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, User, UserRole, UserClub, Club, CachedUserData, ClubMembership } from './user.service';
import { ErrorHandlerService } from './error-handler.service';
import { environment } from '../../environments/environment';

declare const createSpyObj: (name: string, methods: string[]) => any;

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let errorHandlerService: any;

  beforeEach(() => {
    const errorHandlerSpy = createSpyObj('ErrorHandlerService', ['handleApiError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: ErrorHandlerService, useValue: errorHandlerSpy }
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    errorHandlerService = TestBed.inject(ErrorHandlerService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllUsers', () => {
    it('should return users array', () => {
      const mockUsers: User[] = [
        { firebase_uid: 'uid1', email: 'user1@test.com', username: 'user1' },
        { firebase_uid: 'uid2', email: 'user2@test.com', username: 'user2' }
      ];

      service.getAllUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle error and return empty array', () => {
      service.getAllUsers().subscribe(users => {
        expect(users).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getUsersWithPagination', () => {
    it('should return paginated users', () => {
      const mockUsers: User[] = [
        { firebase_uid: 'uid1', email: 'user1@test.com', username: 'user1' }
      ];

      service.getUsersWithPagination(0, 10).subscribe(users => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/page/0/size/10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle error and return empty array', () => {
      service.getUsersWithPagination(0, 10).subscribe(users => {
        expect(users).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/page/0/size/10`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getUserByFirebaseUid', () => {
    it('should return user by firebase uid', () => {
      const mockUser: User = { firebase_uid: 'uid1', email: 'user1@test.com', username: 'user1' };

      service.getUserByFirebaseUid('uid1').subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle error and return null', () => {
      service.getUserByFirebaseUid('uid1').subscribe(user => {
        expect(user).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1`);
      req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', () => {
      const mockUser: User = { firebase_uid: 'uid1', email: 'user1@test.com', username: 'user1' };

      service.getUserByEmail('user1@test.com').subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/email/user1@test.com`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle error and return null', () => {
      service.getUserByEmail('user1@test.com').subscribe(user => {
        expect(user).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/email/user1@test.com`);
      req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createUser', () => {
    it('should create new user', () => {
      const newUser: User = { firebase_uid: 'uid1', email: 'user1@test.com', username: 'user1' };
      const createdUser: User = { ...newUser, first_name: 'John', last_name: 'Doe' };

      service.createUser(newUser).subscribe(user => {
        expect(user).toEqual(createdUser);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(createdUser);
    });

    it('should handle error and return null', () => {
      const newUser: User = { firebase_uid: 'uid1', email: 'user1@test.com', username: 'user1' };

      service.createUser(newUser).subscribe(user => {
        expect(user).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users`);
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateUserProfile', () => {
    it('should update existing user profile', () => {
      const profileData = { first_name: 'John', last_name: 'Doe' };
      const updatedUser: User = { firebase_uid: 'uid1', email: 'user1@test.com', username: 'user1', first_name: 'John', last_name: 'Doe' };

      service.updateUserProfile('uid1', profileData).subscribe(user => {
        expect(user).toEqual(updatedUser);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(profileData);
      req.flush(updatedUser);
    });

    it('should handle error and return null', () => {
      const profileData = { first_name: 'John', last_name: 'Doe' };

      service.updateUserProfile('uid1', profileData).subscribe(user => {
        expect(user).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1/profile`);
      req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('removeRoleFromUser', () => {
    it('should remove role from user and return true', () => {
      service.removeRoleFromUser('uid1', 'admin').subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1/roles/admin`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle error and return false', () => {
      service.removeRoleFromUser('uid1', 'admin').subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1/roles/admin`);
      req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getUserRoles', () => {
    it('should return user roles', () => {
      const mockRoles: UserRole[] = [
        { user_id: 'uid1', role_name: 'ADMIN' },
        { user_id: 'uid1', role_name: 'PLAYER' }
      ];

      service.getUserRoles('uid1').subscribe(roles => {
        expect(roles).toEqual(mockRoles);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1/roles`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRoles);
    });

    it('should handle error and return empty array', () => {
      service.getUserRoles('uid1').subscribe(roles => {
        expect(roles).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1/roles`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getUserClubs', () => {
    it('should return user clubs', () => {
      const mockUserClubs: UserClub[] = [
        {
          user: { firebase_uid: 'uid1', email: 'user1@test.com', username: 'user1' },
          club: { club_id: '1', name: 'Club 1' },
          role: { user_id: 'uid1', role_name: 'MEMBER' }
        }
      ];

      service.getUserClubs('uid1').subscribe(userClubs => {
        expect(userClubs).toEqual(mockUserClubs);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1/clubs`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserClubs);
    });

    it('should handle error and return empty array', () => {
      service.getUserClubs('uid1').subscribe(userClubs => {
        expect(userClubs).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1/clubs`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getCachedUserAuthData', () => {
    it('should return cached user auth data', () => {
      const mockCachedData: CachedUserData = {
        firebase_uid: 'uid1',
        email: 'user1@test.com',
        username: 'user1',
        roles: ['ADMIN', 'PLAYER'],
        club_memberships: [
          { club_id: '1', club_name: 'Club 1', role: 'MEMBER', is_admin: false }
        ],
        cached_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-01-02T00:00:00Z'
      };

      service.getCachedUserAuthData('uid1').subscribe(data => {
        expect(data).toEqual(mockCachedData);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1/auth-data`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCachedData);
    });

    it('should handle error and return null', () => {
      service.getCachedUserAuthData('uid1').subscribe(data => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/firebase/uid1/auth-data`);
      req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const healthStatus = 'Service is healthy';

      service.healthCheck().subscribe(status => {
        expect(status).toBe(healthStatus);
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/health`);
      expect(req.request.method).toBe('GET');
      req.flush(healthStatus);
    });

    it('should handle error and return default message', () => {
      service.healthCheck().subscribe(status => {
        expect(status).toBe('Service unavailable');
      });

      const req = httpMock.expectOne(`${environment.quarkusApiUrl}/users/health`);
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
