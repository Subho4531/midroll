'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { ContactsPage } from '@/components/ContactsPage';

export default function Contacts() {
  return (
    <AppShell>
      <div className="pt-2">
        <ContactsPage />
      </div>
    </AppShell>
  );
}
