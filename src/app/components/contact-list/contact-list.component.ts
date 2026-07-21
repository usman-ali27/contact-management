import { Component, computed, input, output, signal } from '@angular/core';

import { Contact } from '../../core/models/contact.model';

type Presence = 'online' | 'away' | 'offline';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss',
})
export class ContactListComponent {
  readonly contacts = input<Contact[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly selectedId = input<number | null>(null);

  readonly contactSelected = output<Contact>();
  readonly retry = output<void>();
  readonly menu = output<void>();
  readonly previous = output<void>();
  readonly next = output<void>();

  readonly searchTerm = signal('');

  private readonly failedImages = signal<ReadonlySet<number>>(new Set());

  readonly filteredContacts = computed<Contact[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.contacts();
    if (!term) {
      return list;
    }
    return list.filter((c) =>
      `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(term),
    );
  });

  fullName(contact: Contact): string {
    return `${contact.firstName} ${contact.lastName}`;
  }

  subtitle(contact: Contact): string {
    return contact.jobTitle?.trim() || contact.email;
  }

  initials(contact: Contact): string {
    return `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase();
  }

  presence(contact: Contact): Presence {
    const states: Presence[] = ['online', 'away', 'offline'];
    return states[contact.id % states.length];
  }

  imageFailed(contact: Contact): boolean {
    return this.failedImages().has(contact.id);
  }

  onImageError(contact: Contact): void {
    this.failedImages.update((set) => new Set(set).add(contact.id));
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onSelect(contact: Contact): void {
    this.contactSelected.emit(contact);
  }

  onRetry(): void {
    this.retry.emit();
  }

  onMenu(): void {
    this.menu.emit();
  }

  onPrevious(): void {
    this.previous.emit();
  }

  onNext(): void {
    this.next.emit();
  }
}
