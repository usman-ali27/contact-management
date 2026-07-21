export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  bio: string;
  profileImage: string;
  jobTitle?: string;
  dial?: string;
  meeting?: string;
}

export interface EmailAddress {
  id: number;
  contactId: number;
  email: string;
  type: string;
}
