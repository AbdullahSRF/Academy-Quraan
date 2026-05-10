/**
 * روابط apple-touch-startup-image (عمودي).
 * الملفات من: `node scripts/generate-apple-splash.mjs`
 */
export function AppleSplashLinks() {
  const items: { href: string; media: string }[] = [
    {
      href: "/splash/2048x2732.png",
      media:
        "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      href: "/splash/1668x2388.png",
      media:
        "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      href: "/splash/1290x2796.png",
      media:
        "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      href: "/splash/1179x2556.png",
      media:
        "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      href: "/splash/1170x2532.png",
      media:
        "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      href: "/splash/1125x2436.png",
      media:
        "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      href: "/splash/828x1792.png",
      media:
        "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
  ];

  return (
    <>
      {items.map((x) => (
        <link key={x.href + x.media} rel="apple-touch-startup-image" href={x.href} media={x.media} />
      ))}
    </>
  );
}
