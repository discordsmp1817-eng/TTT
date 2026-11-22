/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useCallback, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AppProvider, useApp } from './context/AppContext';
import { PRODUCT_CATEGORIES } from './data/termicoreData';
import { findModelByRoute } from './utils/modelSpecifications';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RfqDrawer } from './components/RfqDrawer';
import { InitialLoader } from './components/InitialLoader';
import { INDUSTRIAL_EASE } from './components/MotionPrimitives';
import { HomePage } from './pages/HomePage';

const ProductsPage = lazy(() =>
  import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage }))
);
const CategoryDetailPage = lazy(() =>
  import('./pages/CategoryDetailPage').then((m) => ({ default: m.CategoryDetailPage }))
);
const ModelDetailPage = lazy(() =>
  import('./pages/ModelDetailPage').then((m) => ({ default: m.ModelDetailPage }))
);
const AccessoriesPage = lazy(() =>
  import('./pages/AccessoriesPage').then((m) => ({ default: m.AccessoriesPage }))
);
const QualityPage = lazy(() =>
  import('./pages/QualityPage').then((m) => ({ default: m.QualityPage }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactQuotePages').then((m) => ({ default: m.ContactPage }))
);
const QuotePage = lazy(() =>
  import('./pages/ContactQuotePages').then((m) => ({ default: m.QuotePage }))
);

function RouteView() {
  const { route } = useApp();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={route}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.14, ease: INDUSTRIAL_EASE }}
        onAnimationComplete={() => ScrollTrigger.refresh()}
      >
        <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
          {renderPageRoute(route)}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function renderPageRoute(route: string) {
  const matchingCategory = PRODUCT_CATEGORIES.find((c) => c.slug === route);
  if (matchingCategory) {
    return <CategoryDetailPage category={matchingCategory} />;
  }

  const matchedModel = findModelByRoute(route);
  if (matchedModel) {
    return (
      <ModelDetailPage
        sku={matchedModel.sku}
        category={matchedModel.category}
      />
    );
  }

  switch (route) {
    case '/products':
      return <ProductsPage />;
    case '/accessories':
      return <AccessoriesPage />;
    case '/quality':
      return <QualityPage />;
    case '/about':
      return <AboutPage />;
    case '/contact':
      return <ContactPage />;
    case '/quote':
      return <QuotePage />;
    case '/':
    default:
      return <HomePage />;
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') !== '1';
  });

  const handleLoaderComplete = useCallback(() => {
    setIsLoading(false);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  return (
    <MotionConfig reducedMotion="never">
      <AppProvider>
        <div className="min-h-screen flex flex-col bg-[#F5F7F9] text-[#101D2B] relative overflow-x-clip">
          {isLoading && <InitialLoader onComplete={handleLoaderComplete} />}
          <Header isLoading={isLoading} />
          <main className="flex-1 overflow-x-clip">
            <RouteView />
          </main>
          <Footer />
          <RfqDrawer />
        </div>
      </AppProvider>
    </MotionConfig>
  );
}
