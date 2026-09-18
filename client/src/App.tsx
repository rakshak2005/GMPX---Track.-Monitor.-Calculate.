import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './layouts/AppLayout.js';
import { Dashboard } from './pages/Dashboard.js';
import { MyIpos } from './pages/MyIpos.js';
import { GmpTracker, ProfitTracker, SubscriptionPage } from './pages/Sections.js';
import { CalendarPage } from './pages/CalendarPage.js';
import { IpoDetail } from './pages/IpoDetail.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AllotmentDeskPage } from './pages/AllotmentDeskPage.js';
import { AddIpoModal } from './components/IpoModals.js';
import { useIpoMutations, useRealtimeSync } from './hooks/useIpos.js';
import { pushToast } from './hooks/useAlerts.js';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

function Shell() {
  useRealtimeSync();
  const [addOpen, setAddOpen] = useState(false);
  const { create } = useIpoMutations();
  return (
    <>
      <Routes>
        <Route element={<AppLayout onAdd={() => setAddOpen(true)} />}>
          <Route index element={<Dashboard onAdd={() => setAddOpen(true)} />} />
          <Route path="ipos" element={<MyIpos />} />
          <Route path="gmp" element={<GmpTracker />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="profit" element={<ProfitTracker />} />
          <Route path="allotment" element={<AllotmentDeskPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="ipo/:id" element={<IpoDetail />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <AddIpoModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        saving={create.isPending}
        onSave={(p) =>
          create.mutate(p, {
            onSuccess: () => setAddOpen(false),
            onError: (e) => pushToast('Could not save IPO', e.message),
          })
        }
      />
    </>
  );
}

import { AuthProvider } from './hooks/useAuth.js';

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <Shell />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
