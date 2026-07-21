import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { Contact } from '../../core/models/contact.model';
import { API_BASE_URL } from '../../core/tokens/api-base-url.token';
import { ContactsPageComponent } from './contacts-page.component';

const BASE = 'https://api.test';

const CONTACT: Contact = {
  id: 1,
  firstName: 'Johanna',
  lastName: 'Stevens',
  address: '1 St',
  phone: '555',
  email: 'j@s.dev',
  bio: 'bio',
  profileImage: 'img',
};

function setup(paramMap: Record<string, string> = {}) {
  const navigate = vi.fn();
  TestBed.configureTestingModule({
    imports: [ContactsPageComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: BASE },
      { provide: Router, useValue: { navigate } },
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap(paramMap)),
          snapshot: { paramMap: convertToParamMap(paramMap) },
        },
      },
    ],
  });
  const httpMock = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(ContactsPageComponent);
  fixture.detectChanges();
  return { fixture, httpMock, navigate };
}

function drainEmails(httpMock: HttpTestingController) {
  httpMock.match((r) => r.url === `${BASE}/email_addresses`).forEach((r) => r.flush([]));
}

describe('ContactsPageComponent', () => {
  it('loads contacts on init and defaults the selection to the first contact', () => {
    const { fixture, httpMock } = setup();

    httpMock.expectOne(`${BASE}/contacts`).flush([CONTACT]);
    fixture.detectChanges();

    const cmp = fixture.componentInstance;
    expect(cmp.contacts()).toHaveLength(1);
    expect(cmp.selectedContact()?.id).toBe(1);

    drainEmails(httpMock);
  });

  it('reflects a selection in the URL by navigating to /contacts/:id', () => {
    const { fixture, httpMock, navigate } = setup();

    httpMock.expectOne(`${BASE}/contacts`).flush([CONTACT]);
    fixture.detectChanges();
    drainEmails(httpMock);

    fixture.componentInstance.onContactSelected({ ...CONTACT, id: 3 });
    expect(navigate).toHaveBeenCalledWith(['/contacts', 3]);
  });

  it('surfaces a friendly message when the contacts request fails', () => {
    const { fixture, httpMock } = setup();

    httpMock.expectOne(`${BASE}/contacts`).error(new ProgressEvent('error'), { status: 0 });
    httpMock.expectOne(`${BASE}/contacts`).error(new ProgressEvent('error'), { status: 0 });

    expect(fixture.componentInstance.error()).toContain('Network error');
  });
});
