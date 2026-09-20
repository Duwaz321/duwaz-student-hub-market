import { useEffect, type ReactNode } from 'react';

interface LegalPageProps {
  title: string;
  intro: ReactNode;
  sections: Array<{
    heading: string;
    body: ReactNode;
  }>;
}

const LegalPage = ({ title, intro, sections }: LegalPageProps) => {
  useEffect(() => {
    document.title = `DUWAZ | ${title}`;
  }, [title]);

  return (
    <div className="min-h-screen bg-[#f9f5f2] text-[#1d130f]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-[#ead7ca] bg-white shadow-[0_18px_45px_rgba(57,29,17,0.08)]">
          <header className="border-b border-[#f0e4dc] bg-[#f7efe9] px-5 py-8 sm:px-8 md:px-10 md:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7b4a2d]">DUWAZ</p>
            <h1 className="mt-3 font-serif text-3xl text-[#2a1a12] md:text-5xl">{title}</h1>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-[#4a332a] md:text-base">
              {intro}
            </div>
          </header>

          <main className="space-y-5 px-5 py-6 sm:px-8 md:px-10 md:py-8">
            {sections.map(({ heading, body }) => (
              <section key={heading} className="rounded-2xl border border-[#f1e5dc] bg-[#fffdfb] p-4 sm:p-5 md:p-6">
                <h2 className="text-lg font-semibold text-[#2d190f] md:text-xl">{heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-[#40312a] md:text-[15px]">
                  {body}
                </div>
              </section>
            ))}
          </main>

          <footer className="border-t border-[#f0e4dc] bg-[#faf5f2] px-5 py-6 sm:px-8 md:px-10">
            <p className="text-sm font-medium text-[#4b2f22]">Last updated: [DATE]</p>
            <p className="mt-3 text-xs leading-6 text-[#5d4438] md:text-sm">
              These documents are draft commercial/privacy policies and should be reviewed by a qualified South African legal/compliance professional before DUWAZ is launched commercially.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
