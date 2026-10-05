'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { ActiveProgressContext } from '@/contexts/ActiveProgressContext';
import { createActiveProgressController } from '@/lib/progress/active';

export function ActiveProgressProvider({ children, controller: suppliedController }) {
  const [controller] = useState(() => suppliedController || createActiveProgressController());
  const binding = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  useEffect(() => {
    void controller.start();
    return () => controller.stop();
  }, [controller]);
  const value = useMemo(() => ({ ...binding,
    isCurrentBinding: controller.isCurrentBinding,
    reconnect: controller.reconnect, signOut: controller.signOut, sync: controller.sync,
    retryRetainedQuizUpdates: controller.retryRetainedQuizUpdates,
    previewGuestTransfer: controller.previewGuestTransfer, confirmGuestTransfer: controller.confirmGuestTransfer,
  }), [binding, controller]);
  return <ActiveProgressContext.Provider value={value}>{children}</ActiveProgressContext.Provider>;
}
