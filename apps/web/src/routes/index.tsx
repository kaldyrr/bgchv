import { component$, useOnWindow, useSignal, $ } from '@builder.io/qwik';
import { qwikify$ } from '@builder.io/qwik-react';
import { Button, Navbar } from '@crm/ui';
import type React from 'react';
import { createCRMStore } from '@crm/model';
import { YJS_WS } from '../lib/config';

// Wrap React components from @crm/ui for Qwik
const ReactButton = qwikify$<React.ComponentProps<typeof Button>>((props) => <Button {...props} />);
const ReactNavbar = qwikify$<React.ComponentProps<typeof Navbar>>((props) => <Navbar {...props} />);

export default component$(() => {
  const connected = useSignal(false);
  // Initialize CRDT/Zustand model once in browser
  useOnWindow('load', $( () => {
    const { useStore, provider } = createCRMStore({ persist: true, wsUrl: YJS_WS });
    provider.on('status', (e: any) => {
      connected.value = e.status === 'connected';
    });
    // Example: seed one company if empty on first connect
    const unsub = useStore.subscribe((s) => {
      if (s.companies.length === 0) {
        s.addCompany({ name: 'Acme Inc.' });
      }
    });
    // just for demo lifetime
    setTimeout(() => unsub(), 2000);
  }));

  return (
    <>
      <ReactNavbar title={`CRM ${connected.value ? '• Online' : '• Offline'}`} />
      <main class="mx-auto max-w-6xl p-4 space-y-6">
        <section class="flex items-center gap-3">
          <ReactButton onClick$={$(() => console.log('Hello from React inside Qwik'))}>New Contact</ReactButton>
          <a class="text-blue-600 underline" href="/contacts">Contacts</a>
          <a class="text-blue-600 underline" href="/companies">Companies</a>
          <a class="text-blue-600 underline" href="/deals">Deals</a>
        </section>
        <section>
          <h2 class="text-lg font-semibold mb-2">Welcome</h2>
          <p>Hybrid CRM starter: Qwik + React + Zustand + Yjs + Tailwind + Radix.</p>
        </section>
      </main>
    </>
  );
});
