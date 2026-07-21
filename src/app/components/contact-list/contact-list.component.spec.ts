import { TestBed } from '@angular/core/testing';

import { Contact } from '../../core/models/contact.model';
import { ContactListComponent } from './contact-list.component';

function makeContact(partial: Partial<Contact> & { id: number }): Contact {
  return {
    firstName: 'First',
    lastName: 'Last',
    address: '1 St',
    phone: '555-0000',
    email: 'first.last@test.dev',
    bio: 'bio',
    profileImage: 'img',
    ...partial,
  };
}

describe('ContactListComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [ContactListComponent] }).compileComponents(),
  );

  it('filters contacts by the search term (name, email or phone)', () => {
    const fixture = TestBed.createComponent(ContactListComponent);
    fixture.componentRef.setInput('contacts', [
      makeContact({ id: 1, firstName: 'Johanna', lastName: 'Stevens' }),
      makeContact({ id: 2, firstName: 'Nicholas', lastName: 'Gordon', phone: '212-555-0123' }),
    ]);
    const cmp = fixture.componentInstance;

    cmp.searchTerm.set('johanna');
    expect(cmp.filteredContacts().map((c) => c.id)).toEqual([1]);

    cmp.searchTerm.set('212-555');
    expect(cmp.filteredContacts().map((c) => c.id)).toEqual([2]);

    cmp.searchTerm.set('');
    expect(cmp.filteredContacts().length).toBe(2);
  });

  it('emits the clicked contact via contactSelected', () => {
    const fixture = TestBed.createComponent(ContactListComponent);
    const cmp = fixture.componentInstance;
    const target = makeContact({ id: 5 });

    let emitted: Contact | undefined;
    cmp.contactSelected.subscribe((c) => (emitted = c));

    cmp.onSelect(target);
    expect(emitted).toBe(target);
  });

  it('uses the job title as subtitle when present, otherwise the email', () => {
    const fixture = TestBed.createComponent(ContactListComponent);
    const cmp = fixture.componentInstance;

    expect(cmp.subtitle(makeContact({ id: 1, email: 'a@b.c' }))).toBe('a@b.c');
    expect(cmp.subtitle(makeContact({ id: 1, jobTitle: 'Developer' }))).toBe('Developer');
  });
});
