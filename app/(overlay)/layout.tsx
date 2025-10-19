export default function OverlayGroupLayout({ children }: { children: React.ReactNode }) {
  // Без шапки/меню/футера — только содержимое оверлея
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0b1020" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <title>Vibekip Overlay</title>
      </head>
      <body className="bg-[#0b1020] text-[#e6e9f2] antialiased min-h-dvh">
        {children}
      </body>
    </html>
  );
}




