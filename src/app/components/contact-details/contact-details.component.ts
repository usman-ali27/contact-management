import { Component, computed, effect, input, output, signal } from '@angular/core';

import { Contact, EmailAddress } from '../../core/models/contact.model';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss',
})
export class ContactDetailsComponent {
  readonly contact = input<Contact | null>(null);
  readonly emailAddresses = input<EmailAddress[]>([]);
  readonly emailsLoading = input(false);

  readonly back = output<void>();

  readonly imageFailed = signal(false);

  constructor() {
    effect(() => {
      this.contact();
      this.imageFailed.set(false);
    });
  }

  readonly fullName = computed(() => {
    const c = this.contact();
    return c ? `${c.firstName} ${c.lastName}` : '';
  });

  readonly subtitle = computed(() => {
    const c = this.contact();
    return c ? c.jobTitle?.trim() || c.email : '';
  });

  readonly initials = computed(() => {
    const c = this.contact();
    return c ? `${c.firstName.charAt(0)}${c.lastName.charAt(0)}`.toUpperCase() : '';
  });

  readonly emails = computed<EmailAddress[]>(() => {
    const fetched = this.emailAddresses();
    if (fetched.length > 0) {
      return fetched;
    }
    const c = this.contact();
    return c ? [{ id: -1, contactId: c.id, email: c.email, type: 'Primary' }] : [];
  });

  onImageError(): void {
    this.imageFailed.set(true);
  }

  onBack(): void {
    this.back.emit();
  }
}
