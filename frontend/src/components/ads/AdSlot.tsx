'use client';

import { useEffect, useRef } from 'react';
import { AD_CLIENT } from '../../config/ads';
import { waitForAdsenseScript } from '../../utils/loadAdsense';

interface AdSlotProps {
  slotId: string;
  format?: string;
  className?: string;
  style?: React.CSSProperties;
}

const AdSlot = ({ slotId, format = 'auto', className = '', style = {} }: AdSlotProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!slotId || !AD_CLIENT) return;
    let cancelled = false;

    waitForAdsenseScript().then((ok) => {
      if (cancelled || !ok) return;
      try {
        const win = window as any;
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      } catch (e) {
        console.warn('AdSense push error:', e);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slotId]);

  if (!slotId) return null;

  return (
    <div className={`adsense-slot min-h-[90px] flex items-center justify-center ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSlot;
