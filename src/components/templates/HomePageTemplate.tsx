'use client';

import { Hero } from '@/components/organisms/Hero';
import { RateDashboard } from '@/components/organisms/RateDashboard';
import { RemittanceWizard } from '@/components/organisms/RemittanceWizard';

export function HomePageTemplate() {
  return (
    <>
      <Hero />
      <RateDashboard />
      <RemittanceWizard />
    </>
  );
}
