"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, ChevronDown, Mail, Phone, MessageSquare,
  Truck, RotateCcw, CreditCard, Package, Wrench,
  Clock, CheckCircle, Send, MapPin, AlertCircle, X,
} from "lucide-react";

// ── FAQ ───────────────────────────────────────────────────────
const FAQ_SECTIONS = [
  {
    category: "Orders & Shipping",
    icon: Truck,
    items: [
      { q:"How long does shipping take?", a:"Standard shipping takes 5–7 business days. Express is 2–3 days and overnight delivers the next business day. Orders placed before 2 PM EST ship the same day." },
      { q:"How do I track my order?", a:"Once your order ships you'll receive an email with a tracking number. You can also log in to My Account and view the status under 'My Orders'. Click the tracking number for real-time updates." },
      { q:"Do you offer free shipping?", a:"Yes! All orders over $75 qualify for free standard shipping automatically — no code needed. Free shipping applies to the 48 contiguous US states." },
      { q:"Can I change or cancel my order?", a:"Orders can be modified or cancelled within 1 hour of placement. After that the order enters our fulfilment pipeline. Contact support immediately if you need to cancel." },
      { q:"Do you offer store pickup?", a:"Yes — select 'Store Pickup' at checkout. Your order will be ready within 2 hours at our Detroit warehouse. You'll receive an email confirmation when it's ready to collect." },
    ],
  },
  {
    category: "Returns & Refunds",
    icon: RotateCcw,
    items: [
      { q:"What is your return policy?", a:"We accept returns within 30 days of delivery. Items must be unused, in original packaging, and in resalable condition. Electrical parts and special-order items are final sale unless defective." },
      { q:"How do I start a return?", a:"Log in to My Account, go to My Orders, and click 'Return Item' next to the product. We'll email you a prepaid return label within 24 hours." },
      { q:"When will I receive my refund?", a:"Once we receive and inspect the returned item, refunds are processed within 3–5 business days to your original payment method. You'll receive an email confirmation when issued." },
      { q:"What if I received the wrong or defective part?", a:"Contact us within 7 days of delivery with photos of the item and packaging. We'll ship a replacement at no charge, or issue a full refund — your choice." },
    ],
  },
  {
    category: "Parts & Compatibility",
    icon: Wrench,
    items: [
      { q:"How do I know if a part fits my vehicle?", a:"Every product page has a Compatibility tab showing all confirmed fitments by make, model, and year. Use our Vehicle Finder to pre-filter parts for your specific car." },
      { q:"Are your parts OEM or aftermarket?", a:"We carry both. OEM parts are made by the vehicle's manufacturer. Aftermarket parts are made by third parties to OEM specs or better. Both are clearly labelled on product pages." },
      { q:"Do you provide installation support?", a:"Yes — each product page includes an Installation tab with step-by-step guides, tool lists, and difficulty ratings. For complex jobs we recommend a certified mechanic." },
      { q:"What brands do you carry?", a:"We stock 200+ brands including Bosch, Brembo, Denso, ACDelco, Monroe, K&N, NGK, and Moog. Browse our full brand catalogue at /brands." },
    ],
  },
  {
    category: "Payment & Account",
    icon: CreditCard,
    items: [
      { q:"What payment methods do you accept?", a:"We accept Visa, Mastercard, Amex, cash on delivery, and online bank transfer. All card transactions are SSL encrypted and PCI-DSS compliant." },
      { q:"Is my payment information secure?", a:"Absolutely. We never store your full card number. All processing is handled by our PCI Level 1 certified payment processor with 3D Secure authentication." },
      { q:"How do loyalty points work?", a:"You earn 1 point for every $1 spent. 100 points = $1 in store credit. Points never expire and can be applied at checkout. Try AUTOCORE10 for 10% off your first order." },
      { q:"How do I reset my password?", a:"Click 'Forgot Password' on the login page. Enter your registered email address and we'll send a reset link within 2 minutes. The link expires after 15 minutes." },
    ],
  },
];

interface ContactForm {
  name: string; email: string; phone: string;
  orderNumber: string; subject: string; message: string; category: string;
}

export default function SupportClient() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState("all");
  const [form, setForm] = useState<ContactForm>({
    name:"", email:"", phone:"", orderNumber:"", subject:"", message:"", category:"General",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [trackingNum, setTrackingNum] = useState("");
  const [trackingResult, setTrackingResult] = useState<string|null>(null);

  const set = (k: keyof ContactForm, v: string) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setFormError("Please fill all required fields."); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setFormError("Enter a valid email address."); return; }
    setFormError("");
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleTrack = () => {
    if (!trackingNum) return;
    setTrackingResult(trackingNum.startsWith("AC-") ? "In Transit — Expected delivery Oct 15, 2024" : "Tracking number not found. Check your confirmation email.");
  };

  const displayedFaqs = activeCat === "all" ? FAQ_SECTIONS : FAQ_SECTIONS.filter(s=>s.category===activeCat);
  const ic = "w-full bg-[#f9f9f9] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000] transition";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-[#0d0d0d]">Home</Link>
        <ChevronRight size={12}/>
        <span className="text-[#0d0d0d] font-semibold">Support</span>
      </nav>

      {/* Hero */}
      <div className="bg-[#0d0d0d] rounded-2xl p-8 mb-8 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage:"radial-gradient(circle at 1px 1px,#d4f000 1px,transparent 0)", backgroundSize:"24px 24px" }}/>
        <div className="relative">
          <h1 className="text-3xl font-extrabold text-white mb-2">How can we help?</h1>
          <p className="text-gray-400 text-sm mb-6">Browse our FAQ, track your order, or send us a message.</p>
          {/* Quick order tracker */}
          <div className="flex gap-2 max-w-md mx-auto">
            <input value={trackingNum} onChange={e=>setTrackingNum(e.target.value)} placeholder="Enter order number (e.g. AC-20241001)"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d4f000]"/>
            <button onClick={handleTrack} className="bg-[#d4f000] text-[#0d0d0d] font-bold px-5 py-2.5 rounded-xl hover:bg-[#c4e000] text-sm shrink-0">Track</button>
          </div>
          {trackingResult && (
            <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${trackingResult.includes("not found")?"bg-red-500/20 text-red-300":"bg-green-500/20 text-green-300"}`}>
              {trackingResult.includes("not found") ? <AlertCircle size={14}/> : <CheckCircle size={14}/>}
              {trackingResult}
            </div>
          )}
        </div>
      </div>

      {/* Contact options */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon:Phone,         title:"Call Us",        sub:"Mon–Fri 8am–8pm EST",   val:"1-800-AUTO-CORE",       href:"tel:18002886273" },
          { icon:Mail,          title:"Email Support",  sub:"Reply within 4 hours",  val:"support@autocore.com",  href:"mailto:support@autocore.com" },
          { icon:MessageSquare, title:"Live Chat",       sub:"Avg. wait < 2 min",     val:"Chat with an expert",  href:"#contact-form" },
        ].map(({icon:Icon,title,sub,val,href})=>(
          <a key={title} href={href} className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-[#d4f000] hover:shadow-md p-5 flex flex-col items-center text-center transition-all">
            <div className="w-12 h-12 bg-[#f4f4f4] rounded-2xl flex items-center justify-center mb-3 group-hover:bg-[#d4f000]/10 transition-colors"><Icon size={22} className="text-[#0d0d0d]"/></div>
            <div className="font-extrabold text-[#0d0d0d] text-sm mb-0.5">{title}</div>
            <div className="text-xs text-gray-500 mb-2">{sub}</div>
            <div className="text-xs font-bold text-[#0d0d0d]">{val}</div>
          </a>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* ── FAQ ──────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-extrabold text-[#0d0d0d] mb-4">Frequently Asked Questions</h2>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 pb-1 mb-5">
            <button onClick={()=>setActiveCat("all")} className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${activeCat==="all"?"bg-[#0d0d0d] text-white border-[#0d0d0d]":"bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}>All Topics</button>
            {FAQ_SECTIONS.map(({category,icon:Icon})=>(
              <button key={category} onClick={()=>setActiveCat(category)} className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${activeCat===category?"bg-[#0d0d0d] text-white border-[#0d0d0d]":"bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                <Icon size={11}/>{category}
              </button>
            ))}
          </div>

          {displayedFaqs.map(({category,icon:Icon,items})=>(
            <div key={category} className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className="text-gray-400"/><span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">{category}</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {items.map((item,i)=>{
                  const key=`${category}-${i}`;
                  const isOpen=openFaq===key;
                  return (
                    <div key={key} className={`border-b border-gray-100 last:border-0 ${isOpen?"bg-[#f9f9f9]":""}`}>
                      <button onClick={()=>setOpenFaq(isOpen?null:key)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left">
                        <span className={`text-sm font-bold ${isOpen?"text-[#0d0d0d]":"text-gray-700"}`}>{item.q}</span>
                        <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${isOpen?"rotate-180":""}`}/>
                      </button>
                      {isOpen && <div className="px-5 pb-4"><p className="text-sm text-gray-600 leading-relaxed">{item.a}</p></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Contact Form ─────────────────────────────────── */}
        <div className="lg:col-span-2" id="contact-form">
          <h2 className="text-xl font-extrabold text-[#0d0d0d] mb-4">Send Us a Message</h2>

          {submitted ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={28} className="text-green-600"/></div>
              <h3 className="font-extrabold text-[#0d0d0d] text-lg mb-1">Message Received!</h3>
              <p className="text-sm text-gray-500 mb-6">We&apos;ll reply to <span className="font-bold text-[#0d0d0d]">{form.email}</span> within 4 hours.</p>
              <button onClick={()=>{setSubmitted(false);setForm({name:"",email:"",phone:"",orderNumber:"",subject:"",message:"",category:"General"});}}
                className="text-sm font-bold border-2 border-gray-200 px-5 py-2.5 rounded-xl hover:border-[#0d0d0d]">Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle size={14}/>{formError}
                  <button onClick={()=>setFormError("")} className="ml-auto"><X size={13}/></button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Category</label>
                <select value={form.category} onChange={e=>set("category",e.target.value)} className={`${ic} appearance-none`}>
                  {["General","Order Issue","Return / Refund","Part Compatibility","Technical Support","Billing","Other"].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Full Name *</label>
                  <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="John Doe" className={ic}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@email.com" className={ic}/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+1 (555) 000-0000" className={ic}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Order # (optional)</label>
                  <input value={form.orderNumber} onChange={e=>set("orderNumber",e.target.value)} placeholder="AC-20241001" className={ic}/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Subject *</label>
                <input value={form.subject} onChange={e=>set("subject",e.target.value)} placeholder="How can we help?" className={ic}/>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Message *</label>
                <textarea rows={5} value={form.message} onChange={e=>set("message",e.target.value)} placeholder="Describe your issue in detail…" className={`${ic} resize-none`}/>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-3.5 rounded-xl hover:bg-[#c4e000] disabled:opacity-60 text-sm">
                {submitting?<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Sending…</>:<><Send size={15}/>Send Message</>}
              </button>
              <p className="text-[10px] text-gray-400 text-center">Average response: <span className="font-bold">under 4 hours</span> · Mon–Sat 8am–8pm EST</p>
            </form>
          )}

          {/* Business info */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">Our Office</div>
            {[
              { icon:MapPin, text:"4821 Industrial Blvd, Detroit, MI 48201" },
              { icon:Phone,  text:"1-800-AUTO-CORE (288-6273)" },
              { icon:Mail,   text:"support@autocore.com" },
              { icon:Clock,  text:"Mon–Sat: 8am–8pm EST · Sun: 10am–5pm" },
              { icon:Package,text:"Same-day dispatch on orders before 2 PM EST" },
            ].map(({icon:Icon,text})=>(
              <div key={text} className="flex items-start gap-2.5 text-sm text-gray-600">
                <Icon size={14} className="text-[#0d0d0d] shrink-0 mt-0.5"/>{text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
