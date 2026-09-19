import Link from "next/link";
import {
  ChevronRight, Shield, Truck, Star, Users, Award,
  Wrench, Heart, ArrowRight, CheckCircle, Target,
  Eye, Zap, Package, Headphones,
} from "lucide-react";

const TEAM = [
  { name: "Daniel Park",     role: "CEO & Co-Founder",         img: "https://randomuser.me/api/portraits/men/32.jpg",  bio: "20+ years in automotive retail. Former VP at AutoZone." },
  { name: "Sarah Mitchell",  role: "Head of Procurement",      img: "https://randomuser.me/api/portraits/women/44.jpg", bio: "Certified ASE Master Technician. Ensures every part meets our quality bar." },
  { name: "James Torres",    role: "CTO",                      img: "https://randomuser.me/api/portraits/men/65.jpg",  bio: "Built Auto Core's platform from scratch. Ex-Amazon engineer." },
  { name: "Rachel Kim",      role: "Customer Experience Lead", img: "https://randomuser.me/api/portraits/women/22.jpg", bio: "Obsessed with zero-friction support. NPS score of 82 on her watch." },
];

const MILESTONES = [
  { year: "2015", title: "Founded in Detroit",     desc: "Started in a garage with a vision to democratize OEM parts access." },
  { year: "2017", title: "10,000 Parts Listed",    desc: "Crossed our first major catalogue milestone with 50+ brands." },
  { year: "2019", title: "Free Shipping Launch",   desc: "Introduced free shipping on orders over $75 — an industry first at our scale." },
  { year: "2021", title: "500K Parts In Stock",    desc: "Expanded our warehouse network to 3 distribution centers nationally." },
  { year: "2023", title: "200+ Brands",            desc: "Reached agreements with over 200 trusted automotive manufacturers." },
  { year: "2024", title: "50K+ Customers Served",  desc: "Celebrated 50,000 happy customers with a 4.9-star average rating." },
];

const WHY_CHOOSE = [
  { icon: Shield,     title: "Quality Auto Parts",     desc: "Every part is sourced directly from OEM and certified manufacturers. We carry zero grey-market, zero counterfeit parts — guaranteed." },
  { icon: Award,      title: "Trusted Brands",         desc: "We stock 200+ world-class brands including Bosch, Brembo, Denso, Monroe, K&N, and NGK — vetted by our expert procurement team." },
  { icon: Truck,      title: "Fast Delivery",          desc: "Same-day dispatch on in-stock items. Standard 5–7 day shipping or express 2–3 day options. Free shipping on all orders over $75." },
  { icon: Headphones, title: "Customer Support",       desc: "Dedicated automotive experts available 7 days a week. Live chat, phone, and email — average response time under 4 hours." },
  { icon: Wrench,     title: "Automotive Expertise",   desc: "Our team includes ASE-certified technicians who verify compatibility, write installation guides, and answer your technical questions." },
  { icon: Zap,        title: "Always In Stock",        desc: "With 500,000+ SKUs across 3 distribution centers, we maintain industry-leading fill rates so you get what you need, when you need it." },
];

export default function AboutClient() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="bg-[#0d0d0d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage:"radial-gradient(circle at 1px 1px,#d4f000 1px,transparent 0)", backgroundSize:"28px 28px" }}/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-300">Home</Link>
            <ChevronRight size={12} className="text-gray-600"/>
            <span className="text-gray-300 font-semibold">About</span>
          </nav>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#d4f000]/10 border border-[#d4f000]/20 text-[#d4f000] text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <Wrench size={11}/> Our Story
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              Reliable Parts.<br/><span className="text-[#d4f000]">Real Trust.</span>
            </h1>
            <p className="text-gray-400 mt-5 text-base leading-relaxed max-w-xl">
              Auto Core was founded by car enthusiasts who were tired of counterfeit parts, inflated prices, and unreliable suppliers. We built the platform we always wished existed — one where quality and transparency are non-negotiable.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/shop" className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-6 py-3 rounded-xl hover:bg-[#c4e000] text-sm">Shop Now <ArrowRight size={15}/></Link>
              <Link href="/support" className="inline-flex items-center gap-2 bg-white/5 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 text-sm">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <div className="bg-[#d4f000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[["500K+","Parts In Stock"],["200+","Trusted Brands"],["50K+","Happy Customers"],["4.9★","Average Rating"]].map(([v,l])=>(
            <div key={l}><div className="text-2xl font-black text-[#0d0d0d]">{v}</div><div className="text-xs font-semibold text-[#0d0d0d]/60 mt-0.5">{l}</div></div>
          ))}
        </div>
      </div>

      {/* ── About Auto Core ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-1 bg-[#d4f000] rounded-full"/>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0d0d0d]">About Auto Core</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#0d0d0d] leading-tight mb-4">
              A parts platform built by drivers, for drivers
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Founded in Detroit in 2015, Auto Core began with a simple idea: buying the right part for your car should be easy, affordable, and reliable. We started with 1,000 SKUs and a garage warehouse. Today we stock over 500,000 parts from 200+ brands in 3 distribution centers across the US.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our team of ASE-certified technicians, engineers, and automotive enthusiasts works every day to ensure that every product we list is genuine, every price is fair, and every customer gets exactly what they need.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:"Founded",        value:"2015",     icon:"🏭" },
              { label:"HQ",             value:"Detroit",  icon:"📍" },
              { label:"Employees",      value:"180+",     icon:"👥" },
              { label:"Parts Shipped",  value:"2M+",      icon:"📦" },
            ].map(({label,value,icon})=>(
              <div key={label} className="bg-[#f9f9f9] border border-gray-100 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="font-extrabold text-[#0d0d0d] text-xl">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mission & Vision ─────────────────────────────────── */}
      <div className="bg-[#f9f9f9] border-t border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-6">
          {/* Mission */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="w-12 h-12 bg-[#d4f000] rounded-2xl flex items-center justify-center mb-4">
              <Target size={22} className="text-[#0d0d0d]"/>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-1 bg-[#d4f000] rounded-full"/>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0d0d0d]">Our Mission</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#0d0d0d] mb-3">Making quality parts accessible to every driver</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              We exist to remove every obstacle between a driver and the right part. Whether you&apos;re a weekend DIYer or a professional mechanic, Auto Core gives you direct access to genuine OEM and aftermarket parts at fair prices, with expert support every step of the way.
            </p>
            <div className="space-y-2">
              {["Source directly from manufacturers — no middlemen","Verify compatibility with real-time fitment engine","Ship from 3 US centers for fastest delivery","Back every purchase with 30-day hassle-free returns"].map(item=>(
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle size={15} className="text-[#d4f000] shrink-0 mt-0.5"/>
                  <p className="text-xs text-gray-600 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vision */}
          <div className="bg-[#0d0d0d] rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage:"radial-gradient(circle at 1px 1px,#d4f000 1px,transparent 0)", backgroundSize:"24px 24px" }}/>
            <div className="relative">
              <div className="w-12 h-12 bg-[#d4f000]/10 border border-[#d4f000]/20 rounded-2xl flex items-center justify-center mb-4">
                <Eye size={22} className="text-[#d4f000]"/>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-1 bg-[#d4f000] rounded-full"/>
                <span className="text-xs font-bold uppercase tracking-widest text-[#d4f000]">Our Vision</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-3">The most trusted name in automotive parts</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                By 2030, we aim to be the first choice for automotive parts in North America — the platform that every driver and every mechanic trusts by default, known for unmatched selection, speed, and expertise.
              </p>
              <div className="space-y-3">
                {[["1M+ SKUs","The largest verified parts catalogue"],["Same-day","Delivery to 90% of the US"],["Zero counterfeits","Every part authenticated"],["AI fitment","Smart compatibility for every vehicle"]].map(([v,l])=>(
                  <div key={v} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#d4f000]/10 border border-[#d4f000]/20 rounded-xl flex items-center justify-center shrink-0">
                      <Zap size={13} className="text-[#d4f000]"/>
                    </div>
                    <div><div className="text-white text-xs font-extrabold">{v}</div><div className="text-gray-500 text-[10px]">{l}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why Choose Us ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-8 h-1 bg-[#d4f000] rounded-full"/>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0d0d0d]">Why Choose Us</span>
            <span className="w-8 h-1 bg-[#d4f000] rounded-full"/>
          </div>
          <h2 className="text-3xl font-extrabold text-[#0d0d0d]">Built Different. Built Better.</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">Six reasons thousands of drivers and mechanics choose Auto Core over everyone else.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_CHOOSE.map(({icon:Icon,title,desc})=>(
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-[#d4f000] transition-all">
              <div className="w-12 h-12 bg-[#d4f000]/10 border border-[#d4f000]/20 rounded-2xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-[#0d0d0d]"/>
              </div>
              <h3 className="font-extrabold text-[#0d0d0d] mb-2">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline ─────────────────────────────────────────── */}
      <div className="bg-[#f9f9f9] py-16 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-8 h-1 bg-[#d4f000] rounded-full"/>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0d0d0d]">Our Journey</span>
              <span className="w-8 h-1 bg-[#d4f000] rounded-full"/>
            </div>
            <h2 className="text-3xl font-extrabold text-[#0d0d0d]">A Decade of Growth</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MILESTONES.map(({year,title,desc})=>(
              <div key={year} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#d4f000] hover:shadow-sm transition-all">
                <div className="text-[#d4f000] font-black text-3xl mb-1">{year}</div>
                <div className="font-extrabold text-[#0d0d0d] mb-1.5">{title}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Team ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-8 h-1 bg-[#d4f000] rounded-full"/>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0d0d0d]">The Team</span>
            <span className="w-8 h-1 bg-[#d4f000] rounded-full"/>
          </div>
          <h2 className="text-3xl font-extrabold text-[#0d0d0d]">People Behind Auto Core</h2>
          <p className="text-sm text-gray-500 mt-2">Car people, through and through.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map(({name,role,img,bio})=>(
            <div key={name} className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-md hover:border-[#d4f000] transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-[#f4f4f4]"/>
              <div className="font-extrabold text-[#0d0d0d] text-sm">{name}</div>
              <div className="text-xs text-[#d4f000] font-bold mt-0.5">{role}</div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <div className="bg-[#0d0d0d] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Award size={36} className="text-[#d4f000] mx-auto mb-4"/>
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to get started?</h2>
          <p className="text-gray-400 text-sm mb-8">Join 50,000+ customers who trust Auto Core for their vehicle maintenance.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/shop" className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-8 py-3.5 rounded-xl hover:bg-[#c4e000]">
              Shop All Parts <ArrowRight size={15}/>
            </Link>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white/5 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
