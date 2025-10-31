import { component$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{head.title || 'CRM'}</title>
      {head.meta.map((m, i) => (
        <meta key={i} {...m} />
      ))}
      {head.links.map((l, i) => (
        <link key={i} {...l} />
      ))}
      {head.styles.map((s, i) => (
        <style key={i} {...s.props} dangerouslySetInnerHTML={s.props.dangerouslySetInnerHTML} />
      ))}
      <link rel="canonical" href={loc.url.href} />
    </>
  );
});

