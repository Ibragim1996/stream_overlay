export default function OverlayLayout({ children }: { children: React.ReactNode }) {
  // Без шапки/меню — только содержимое оверлея
  return <>{children}</>;
}