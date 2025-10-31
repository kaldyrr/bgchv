import { component$, Slot, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { track } from '../lib/analytics';

export default component$(() => {
  const loc = useLocation();
  useVisibleTask$(({ track: t }) => {
    t(() => loc.url.pathname);
    track('page_view', loc.url.pathname);
  });
  return (
    <div class="min-h-screen flex flex-col">
      <Slot />
    </div>
  );
});
