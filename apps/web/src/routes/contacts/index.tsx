import { component$, useStore, useOnWindow, $ } from '@builder.io/qwik';
import { qwikify$ } from '@builder.io/qwik-react';
import { createCRMStore } from '@crm/model';
import { YJS_WS } from '../../lib/config';
import { Button, Card, CardContent, CardHeader, Input } from '@crm/ui';

// Wrap React components for use in Qwik
const RButton = qwikify$<React.ComponentProps<typeof Button>>((props) => <Button {...props} />);
const RCard = qwikify$<React.ComponentProps<typeof Card>>((props) => <Card {...props} />);
const RCardHeader = qwikify$<React.ComponentProps<typeof CardHeader>>((props) => <CardHeader {...props} />);
const RCardContent = qwikify$<React.ComponentProps<typeof CardContent>>((props) => <CardContent {...props} />);
const RInput = qwikify$<React.ComponentProps<typeof Input>>((props) => <Input {...props} />);

export default component$(() => {
  const state = useStore({ firstName: '', lastName: '', email: '' });

  useOnWindow('load', $( () => {
    const { useStore: useCRM } = createCRMStore({ persist: true, wsUrl: YJS_WS });
    const { addContact } = useCRM.getState();
    if (useCRM.getState().contacts.length === 0) {
      addContact({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' });
    }
  }));

  return (
    <div class="mx-auto max-w-4xl p-4 space-y-4">
      <RCard>
        <RCardHeader>
          <div class="font-semibold">Add Contact</div>
        </RCardHeader>
        <RCardContent>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <RInput placeholder="First name" value={state.firstName} onChange$={$((e: any) => (state.firstName = e.target.value))} />
            <RInput placeholder="Last name" value={state.lastName} onChange$={$((e: any) => (state.lastName = e.target.value))} />
            <RInput placeholder="Email" value={state.email} onChange$={$((e: any) => (state.email = e.target.value))} />
          </div>
          <div class="mt-3">
            <RButton onClick$={$(() => console.log('Submit handled via React area or future action'))}>Create</RButton>
          </div>
        </RCardContent>
      </RCard>
    </div>
  );
});
