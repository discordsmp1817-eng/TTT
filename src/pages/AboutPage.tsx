import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { IMAGES, WHY_CHOOSE_PILLARS } from '../data/termicoreData';
import { useApp } from '../context/AppContext';
import { EngineeringImage } from '../components/EngineeringImage';
import {
  GlowCard,
  ImageReveal,
  MagneticButton,
  RevealBlock,
  StaggerGrid,
} from '../components/MotionPrimitives';

export function AboutPage() {
  const { navigate } = useApp();

  return (
    <div>
      <section className="bg-[#F5F7F9] bg-engineering-grid border-b border-[#DCE2E8] py-14 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <RevealBlock className="lg:col-span-6" blur>
            <p className="font-mono text-xs font-semibold tracking-wide text-[#0F766E]">
              About TermiCore · State-of-the-Art Production
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#101D2B] text-balance">
              Precision Engineered in Our Advanced Manufacturing Facility
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              TermiCore operates a fully integrated precision manufacturing plant equipped with automated stamping presses, high-speed polyamide injection molding, and optical metrology laboratories to ensure absolute electrical reliability.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-[#101D2B]">
              <span>ISO 9001:2015 Certified</span>
              <span aria-hidden="true" className="text-[#CBD5E1]">/</span>
              <span>Automated Stamping &amp; Molding</span>
              <span aria-hidden="true" className="text-[#CBD5E1]">/</span>
              <span>100% Dielectric Tested</span>
            </div>
          </RevealBlock>

          <ImageReveal
            direction="left"
            immediate
            parallax
            className="lg:col-span-6 rounded-lg border border-[#DCE2E8] bg-[#EEF2F6] aspect-[16/10] shadow-xs"
          >
            <EngineeringImage
              src={IMAGES.controlCabinet}
              alt="TermiCore automated manufacturing facility and control assembly plant"
              fallbackTitle="TermiCore Production Facility Floor"
              className="h-full w-full object-cover"
            />
          </ImageReveal>
        </div>
      </section>

      {/* Real Factory Showcase Section */}
      <section className="bg-white py-16 lg:py-24 border-b border-[#DCE2E8]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <RevealBlock className="max-w-3xl mb-12">
            <p className="font-mono text-xs font-semibold tracking-wide text-[#0F766E]">
              Factory Floor &amp; Laboratory Infrastructure
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101D2B]">
              Inside Our Vertically Integrated Plant
            </h2>
            <p className="mt-3 text-base text-[#475569]">
              From raw electrolytic copper coil to finished UL-recognized terminal blocks, every production cell is calibrated for zero-defect output.
            </p>
          </RevealBlock>

          <StaggerGrid className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" stagger={0.1} y={24}>
            <div data-stagger-item className="flex">
              <GlowCard variant="elevated" className="w-full p-6">
                <div className="overflow-hidden rounded-md border border-[#DCE2E8] bg-[#EEF2F6] aspect-[16/10] mb-4">
                  <EngineeringImage
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
                    alt="Automated metal stamping and pressing machine on factory floor"
                    fallbackTitle="Automated Metal Stamping Cell"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="font-mono text-xs font-semibold text-[#0F766E]">Cell 01 · Stamping</div>
                <h3 className="mt-1 font-display text-lg font-bold text-[#101D2B]">
                  High-Precision Copper Stamping
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#475569]">
                  Multi-stage progressive dies stamp electrolytic copper into current bars with exact tolerance margins, ensuring low electrical resistance and secure wire clamping.
                </p>
              </GlowCard>
            </div>

            <div data-stagger-item className="flex">
              <GlowCard variant="elevated" className="w-full p-6">
                <div className="overflow-hidden rounded-md border border-[#DCE2E8] bg-[#EEF2F6] aspect-[16/10] mb-4">
                  <EngineeringImage
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                    alt="Polyamide injection molding machinery and quality inspection"
                    fallbackTitle="Polyamide Injection Molding"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="font-mono text-xs font-semibold text-[#0F766E]">Cell 02 · Molding</div>
                <h3 className="mt-1 font-display text-lg font-bold text-[#101D2B]">
                  UL 94 V-0 Polyamide Molding
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#475569]">
                  State-of-the-art injection molding presses process self-extinguishing PA 6.6 and high-temp LCP resins into precision housing blocks with flawless dielectric insulation.
                </p>
              </GlowCard>
            </div>

            <div data-stagger-item className="flex">
              <GlowCard variant="elevated" className="w-full p-6">
                <div className="overflow-hidden rounded-md border border-[#DCE2E8] bg-[#EEF2F6] aspect-[16/10] mb-4">
                  <EngineeringImage
                    src="https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80"
                    alt="Quality control laboratory and electrical testing bench"
                    fallbackTitle="Dielectric Testing Laboratory"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="font-mono text-xs font-semibold text-[#0F766E]">Cell 03 · Quality Lab</div>
                <h3 className="mt-1 font-display text-lg font-bold text-[#101D2B]">
                  Dielectric &amp; Pull-Out Testing
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#475569]">
                  Every production batch undergoes 8 kV impulse withstand voltage testing and mechanical wire pull-out verification to guarantee compliance with UL 1059 and IEC 60947-7-1.
                </p>
              </GlowCard>
            </div>
          </StaggerGrid>
        </div>
      </section>

      <section className="bg-[#EEF2F6] text-[#101D2B] border-b border-[#DCE2E8] py-14 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <RevealBlock className="max-w-2xl mb-10">
            <p className="font-mono text-xs font-semibold tracking-wide text-[#0F766E]">
              Engineering Excellence in Every Connection
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#101D2B]">
              Why Professionals Trust TermiCore
            </h2>
          </RevealBlock>

          <StaggerGrid className="grid grid-cols-1 gap-6 md:grid-cols-2" stagger={0.08} y={18}>
            {[
              {
                title: 'Uncompromising Quality',
                detail:
                  'We use high-grade materials including electrolytic copper and UL 94 V-0 flame-retardant polyamides to ensure maximum safety and longevity.',
              },
              {
                title: 'Innovative Design',
                detail:
                  'From Reakdyn anti-loosening screw yokes to spring-loaded clamps, our engineering team continuously refines connection reliability.',
              },
              {
                title: 'Global Compliance',
                detail:
                  'Our terminal blocks are rigorously tested to meet IEC 60947-7-1, UL 1059, CE, RoHS, and ATEX standards for seamless global panel integration.',
              },
              {
                title: 'Dedicated Support',
                detail:
                  'Our technical specialists provide hands-on guidance, from selecting the right terminal block to providing CAD models and evaluation samples.',
              },
            ].map((item) => (
              <div key={item.title} data-stagger-item className="flex">
                <GlowCard variant="elevated" className="w-full p-6">
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 className="h-5 w-5 text-[#0F766E] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-display text-lg font-bold text-[#0F172A]">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#475569]">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </GlowCard>
              </div>
            ))}
          </StaggerGrid>

          <StaggerGrid
            className="mt-10 grid grid-cols-1 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.07}
            y={14}
          >
            {WHY_CHOOSE_PILLARS.map((pillar) => (
              <div
                key={pillar.number}
                data-stagger-item
                className="bg-white p-6 transition-colors hover:bg-[#F7F9FB]"
              >
                <div className="font-mono text-xs font-semibold text-[#0F766E]">
                  {pillar.number}.
                </div>
                <h3 className="mt-2 font-display text-base font-bold text-[#0F172A]">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">
                  {pillar.description}
                </p>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      <section className="bg-[#F5F7F9] py-14 lg:py-16">
        <RevealBlock className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <GlowCard variant="dark" className="bg-engineering-grid-dark p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-white">
                  Let&apos;s Build Something Reliable Together
                </h2>
                <p className="mt-1.5 text-sm text-[#CBD5E1]">
                  Contact our engineering and sales team for inquiries, custom OEM projects, or bulk pricing.
                </p>
              </div>
              <MagneticButton
                type="button"
                onClick={() => navigate('/contact')}
                className="group inline-flex items-center gap-2 rounded-lg bg-[#0D9488] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0F766E] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
              >
                <span>Contact TermiCore</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </MagneticButton>
            </div>
          </GlowCard>
        </RevealBlock>
      </section>
    </div>
  );
}
