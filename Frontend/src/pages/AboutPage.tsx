import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Star, Users, ArrowRight } from 'lucide-react';

const ValueCard = ({ icon: Icon, title, text }: { icon: any; title: string; text: string }) => (
  <div className="bg-white rounded-2xl border border-border/50 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
    <div className="w-10 h-10 rounded-xl bg-duwaz-cream/60 flex items-center justify-center mb-4">
      <Icon className="h-5 w-5 text-duwaz-brown" />
    </div>
    <h3 className="font-semibold text-base text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
  </div>
);

const AboutPage = () => (
  <div className="min-h-screen bg-background">

    {/* Hero */}
    <section className="bg-duwaz-cream/40 border-b border-border/40 py-16 px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <p className="section-label mb-3">Our Story</p>
        <h1 className="section-heading mb-5">Built for students,<br />by students</h1>
        <p className="text-muted-foreground leading-relaxed">
          Duwaz is a student-to-student marketplace empowering campus entrepreneurs and making
          everyday essentials more accessible across South African universities.
        </p>
      </div>
    </section>

    {/* Values */}
    <section className="py-16 px-4 lg:px-6">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <p className="section-label mb-2">What We Stand For</p>
          <h2 className="section-heading">Our Values</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ValueCard icon={Users} title="Student Entrepreneurs" text="We provide an accessible platform for students to launch and grow businesses while studying." />
          <ValueCard icon={Truck} title="Campus Convenience" text="Access affordable everyday essentials — snacks, clothing, supplies — without leaving campus." />
          <ValueCard icon={ShieldCheck} title="Trusted Community" text="Verified student sellers, real reviews, and transparent transactions you can trust." />
          <ValueCard icon={Star} title="Reward Loyalty" text="Earn points with every purchase and redeem them for discounts and exclusive perks." />
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-16 px-4 lg:px-6 bg-duwaz-cream/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <p className="section-label mb-2">Simple Process</p>
          <h2 className="section-heading">How Duwaz Works</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-border/50 p-7">
            <h3 className="font-semibold text-base mb-4 text-foreground">For Shoppers</h3>
            <ul className="space-y-3">
              {[
                'Browse products from verified student shops',
                'Purchase essentials without leaving campus',
                'Earn points redeemable for discounts',
                'Support fellow students and their businesses',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-duwaz-brown mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-border/50 p-7">
            <h3 className="font-semibold text-base mb-4 text-foreground">For Student Sellers</h3>
            <ul className="space-y-3">
              {[
                'Create your shop profile in minutes',
                'List products with photos and pricing',
                'Reach your entire campus community',
                'Gain real entrepreneurial experience',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-duwaz-brown mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 px-4 bg-[#4A2410] text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-15"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C8936A, transparent 50%)' }}
      />
      <div className="relative container mx-auto max-w-xl">
        <h2 className="font-serif text-4xl text-white mb-4">Join the Community</h2>
        <p className="text-white/60 mb-8 leading-relaxed">
          Whether you want to shop or open your own business, Duwaz has a place for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/marketplace" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-duwaz-brown font-semibold text-sm hover:bg-white/95 transition-all shadow-md">
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/create-shop" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all">
            Open a Shop
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;
