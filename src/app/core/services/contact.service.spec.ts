import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Contact, EmailAddress } from '../models/contact.model';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ContactService } from './contact.service';

const BASE = 'https://api.test';

function makeContact(id: number): Contact {
  return {
    id,
    firstName: 'First',
    lastName: 'Last',
    address: '1 St',
    phone: '000',
    email: `c${id}@test.dev`,
    bio: 'bio',
    profileImage: 'img',
  };
}

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContactService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
      ],
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getContacts() GETs /contacts and returns the parsed list', () => {
    const data = [makeContact(1), makeContact(2)];
    let result: Contact[] | undefined;

    service.getContacts().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${BASE}/contacts`);
    expect(req.request.method).toBe('GET');
    req.flush(data);

    expect(result).toEqual(data);
  });

  it('getEmailAddresses() filters by contactId using a query param', () => {
    const data: EmailAddress[] = [{ id: 1, contactId: 7, email: 'x@y.z', type: 'Primary' }];
    let result: EmailAddress[] | undefined;

    service.getEmailAddresses(7).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${BASE}/email_addresses`);
    expect(req.request.params.get('contactId')).toBe('7');
    req.flush(data);

    expect(result).toEqual(data);
  });

  it('maps a network failure to a friendly error message (after one retry)', () => {
    let error: Error | undefined;

    service.getContacts().subscribe({ error: (e: Error) => (error = e) });

    httpMock.expectOne(`${BASE}/contacts`).error(new ProgressEvent('error'), { status: 0 });
    httpMock.expectOne(`${BASE}/contacts`).error(new ProgressEvent('error'), { status: 0 });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toContain('Network error');
  });
});
