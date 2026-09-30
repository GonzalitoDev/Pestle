import { ReactNode, useEffect, useState } from 'react';
import { APK_URL, isApkAvailable, isNative } from '../lib/platform';

/**
 * Link to download the Android app from this site. Hidden inside the app itself; while the APK
 * isn't published yet it renders `fallback` (or nothing).
 */
export default function ApkLink({
  className,
  children,
  fallback = null,
  title,
}: {
  className?: string;
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
}) {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    if (!isNative) isApkAvailable().then(setAvailable);
  }, []);
  if (isNative) return null;
  if (!available) return <>{available === false ? fallback : null}</>;
  return (
    <a href={APK_URL} download="Pestle.apk" className={className} title={title}>
      {children}
    </a>
  );
}
