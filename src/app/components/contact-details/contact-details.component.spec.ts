import { TestBed } from '@angular/core/testing';

import { Contact, EmailAddress } from '../../core/models/contact.model';
import { ContactDetailsComponent } from './contact-details.component';

function makeContact(partial: Partial<Contact> & { id: number }): Contact {
  return {
    firstName: 'Johanna',
    lastName: 'Stevens',
    address: '1 St',
    phone: '555-0000',
    email: 'primary@test.dev',
    bio: 'bio',
    profileImage: 'img',
    ...partial,
  };
}

describe('ContactDetailsComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [ContactDetailsComponent] }).compileComponents(),
  );

  it('composes the full name from first and last name', () => {
    const fixture = TestBed.createComponent(ContactDetailsComponent);
    fixture.componentRef.setInput('contact', makeContact({ id: 1 }));
    expect(fixture.componentInstance.fullName()).toBe('Johanna Stevens');
  });

  it('falls back to the primary email when no addresses are fetched', () => {
    const fixture = TestBed.createComponent(ContactDetailsComponent);
    fixture.componentRef.setInput('contact', makeContact({ id: 1, email: 'p@q.r' }));
    fixture.componentRef.setInput('emailAddresses', []);

    const emails = fixture.componentInstance.emails();
    expect(emails).toHaveLength(1);
    expect(emails[0].email).toBe('p@q.r');
    expect(emails[0].type).toBe('Primary');
  });

  it('uses the fetched email addresses when they are present', () => {
    const fixture = TestBed.createComponent(ContactDetailsComponent);
    const fetched: EmailAddress[] = [
      { id: 1, contactId: 1, email: 'work@test.dev', type: 'Primary' },
      { id: 2, contactId: 1, email: 'store@test.dev', type: 'Secondary' },
    ];
    fixture.componentRef.setInput('contact', makeContact({ id: 1 }));
    fixture.componentRef.setInput('emailAddresses', fetched);

    expect(fixture.componentInstance.emails()).toEqual(fetched);
  });
});
