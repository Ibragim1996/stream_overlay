export default function OverlayLayout({ children }: { children: React.ReactNode }) {
  // Без шапки/меню/футера — только содержимое оверлея
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          footer {
            display: none !important;
          }
        `
      }} />
      {children}
    </>
  );
}