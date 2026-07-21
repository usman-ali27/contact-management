import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { Contact, EmailAddress } from '../../core/models/contact.model';
import { ContactService } from '../../core/services/contact.service';
import { ContactDetailsComponent } from '../../components/contact-details/contact-details.component';
import { ContactListComponent } from '../../components/contact-list/contact-list.component';

@Component({
  selector: 'app-contacts-page',
  imports: [ContactListComponent, ContactDetailsComponent],
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.scss',
})
export class ContactsPageComponent implements OnInit {
  private readonly contactService = inject(ContactService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly contacts = signal<Contact[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly emailAddresses = signal<EmailAddress[]>([]);
  readonly emailsLoading = signal(false);

  readonly listVisible = signal(true);
  readonly mobileView = signal<'list' | 'details'>('list');

  private readonly selectedIdParam = signal<number | null>(null);

  readonly selectedContact = computed<Contact | null>(() => {
    const list = this.contacts();
    const id = this.selectedIdParam();
    if (id === null) {
      return list[0] ?? null;
    }
    return list.find((c) => c.id === id) ?? null;
  });

  private lastEmailContactId: number | null = null;

  constructor() {
    if (this.route.snapshot.paramMap.get('id') !== null) {
      this.mobileView.set('details');
    }

    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id');
      this.selectedIdParam.set(id !== null ? Number(id) : null);
    });

    effect(() => {
      const contact = this.selectedContact();
      if (!contact) {
        this.emailAddresses.set([]);
        this.lastEmailContactId = null;
        return;
      }
      if (contact.id === this.lastEmailContactId) {
        return;
      }
      this.lastEmailContactId = contact.id;
      this.emailAddresses.set([]);
      this.emailsLoading.set(true);
      this.contactService.getEmailAddresses(contact.id).subscribe({
        next: (emails) => {
          this.emailAddresses.set(emails);
          this.emailsLoading.set(false);
        },
        error: () => this.emailsLoading.set(false),
      });
    });
  }

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts.set(contacts);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  onContactSelected(contact: Contact): void {
    this.goTo(contact);
    this.mobileView.set('details');
  }

  selectAdjacent(step: 1 | -1): void {
    const list = this.contacts();
    if (list.length === 0) {
      return;
    }
    const current = this.selectedContact();
    const index = current ? list.findIndex((c) => c.id === current.id) : -1;
    const nextIndex = (index + step + list.length) % list.length;
    this.goTo(list[nextIndex]);
  }

  toggleList(): void {
    this.listVisible.update((visible) => !visible);
  }

  showList(): void {
    this.mobileView.set('list');
  }

  private goTo(contact: Contact): void {
    this.router.navigate(['/contacts', contact.id]);
  }
}
