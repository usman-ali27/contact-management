import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError } from 'rxjs';

import { Contact, EmailAddress } from '../models/contact.model';
import { API_BASE_URL } from '../tokens/api-base-url.token';

interface RawContact {
  id: string | number;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email?: string;
  bio: string;
  profileImage?: string;
  avatar?: string;
  jobTitle?: string;
  dial?: string;
  meeting?: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getContacts(): Observable<Contact[]> {
    return this.http.get<RawContact[]>(`${this.baseUrl}/contacts`).pipe(
      map((raw) => raw.map(this.toContact)),
      retry(1),
      catchError(this.handleError),
    );
  }

  private toContact(raw: RawContact): Contact {
    return {
      id: Number(raw.id),
      firstName: raw.firstName,
      lastName: raw.lastName,
      address: raw.address,
      phone: raw.phone,
      email: raw.email ?? '',
      bio: raw.bio,
      profileImage: raw.profileImage || raw.avatar || '',
      jobTitle: raw.jobTitle,
      dial: raw.dial,
      meeting: raw.meeting,
    };
  }

  getEmailAddresses(contactId: number): Observable<EmailAddress[]> {
    const params = new HttpParams().set('contactId', contactId);
    return this.http
      .get<EmailAddress[]>(`${this.baseUrl}/email_addresses`, { params })
      .pipe(retry(1), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.status === 0
        ? 'Network error — please check your connection and try again.'
        : `Something went wrong (${error.status}). Please try again.`;
    return throwError(() => new Error(message));
  }
}
