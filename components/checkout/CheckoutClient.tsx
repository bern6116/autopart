"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, Check, Lock, CreditCard,
  Truck, MapPin, Package, ArrowLeft,
  ShieldCheck, Banknote, Wifi, Store,
} from "lucide-react";
import { useCart } from "@/lib/cartContext";

// ── Types ─────────────────────────────────────────────────────
interface ShippingForm {
  firstName: string; lastName: string; email: string; phone: string;
  address: string; address2: string; city: string; province: string;
  postalCode: string; country: string;
  deliveryMethod: "standard" | "express" | "pickup";
}
interface PaymentForm {
  method: "cod" | "online" | "card";
  cardName: string; cardNumber: string; expiry: string; cvv: string;
  sameAsBilling: boolean;
}

const DELIVERY_OPTIONS = [
  { id: "standard", icon: Truck,    label: "Standard Delivery", time: "5–7 business days", price: 9.99 },
  { id: "express",  icon: Truck,    label: "Express Delivery",  time: "2–3 business days", price: 19.99 },
  { id: "pickup",   icon: Store,    label: "Store Pickup",      time: "Ready in 2 hours",  price: 0 },
] as const;

const PAYMENT_OPTIONS = [
  { id: "cod",    icon: Banknote,    label: "Cash on Delivery",  desc: "Pay when your order arrives" },
  { id: "card",   icon: CreditCard,  label: "Credit / Debit Card", desc: "Visa, Mastercard, AMEX" },
  { id: "online", icon: Wifi,        label: "Online Payment",    desc: "Bank transfer or e-wallet" },
] as const;

const STEPS = [
  { id: 1, label: "Shipping",  icon: Truck },
  { id: 2, label: "Payment",   icon: CreditCard },
  { id: 3, label: "Review",    icon: Package },
];

const PROVINCES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const TAX_RATE = 0.08;

function fmt(v: string) { return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim(); }
function fmtExp(v: string) { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; }

export default function CheckoutClient() {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [ship, setShip] = useState<ShippingForm>({
    firstName:"", lastName:"", email:"", phone:"",
    address:"", address2:"", city:"", province:"", postalCode:"", country:"US",
    deliveryMethod:"standard",
  });
  const [pay, setPay] = useState<PaymentForm>({
    method:"cod", cardName:"", cardNumber:"", expiry:"", cvv:"", sameAsBilling:true,
  });
  const [shipErrs, setShipErrs] = useState<Partial<Record<keyof ShippingForm,string>>>({});
  const [payErrs,  setPayErrs]  = useState<Partial<Record<keyof PaymentForm,string>>>({});
  const [placing, setPlacing] = useState(false);
  const [orderNum, setOrderNum] = useState<string|null>(null);

  const delivery = DELIVERY_OPTIONS.find(d=>d.id===ship.deliveryMethod);
  const shipCost = delivery?.price ?? 9.99;
  const tax      = (subtotal + shipCost) * TAX_RATE;
  const total    = subtotal + shipCost + tax;

  const ss = (k: keyof ShippingForm, v: string) => setShip(p=>({...p,[k]:v}));
  const sp = (k: keyof PaymentForm,  v: string|boolean) => setPay(p=>({...p,[k]:v}));

  const validateShip = () => {
    const e: typeof shipErrs = {};
    if (!ship.firstName) e.firstName="Required";
    if (!ship.lastName)  e.lastName="Required";
    if (!ship.email || !/\S+@\S+\.\S+/.test(ship.email)) e.email="Valid email required";
    if (!ship.address)   e.address="Required";
    if (!ship.city)      e.city="Required";
    if (!ship.province)  e.province="Required";
    if (!ship.postalCode) e.postalCode="Required";
    setShipErrs(e); return Object.keys(e).length===0;
  };
  const validatePay = () => {
    const e: typeof payErrs = {};
    if (pay.method==="card") {
      if (!pay.cardName) e.cardName="Required";
      if (pay.cardNumber.replace(/\s/g,"").length<16) e.cardNumber="Valid card required";
      if (!/^\d{2}\/\d{2}$/.test(pay.expiry)) e.expiry="MM/YY required";
      if (pay.cvv.length<3) e.cvv="3–4 digits";
    }
    setPayErrs(e); return Object.keys(e).length===0;
  };

  const placeOrder = async () => {
    setPlacing(true);
    await new Promise(r=>setTimeout(r,1400));
    const num = `AC-${Date.now().toString().slice(-8)}`;
    setOrderNum(num);
    clearCart();
    setStep(4);
    setPlacing(false);
  };

  const ic = (err?: string) => `w-full bg-[#f4f4f4] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000] transition ${err?"border-red-400":"border-gray-200"}`;
  const lbl = (t:string) => <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">{t}</label>;
  const fe = (m?:string) => m?<p className="text-xs text-red-500 mt-1">{m}</p>:null;

  // ── Confirmed ─────────────────────────────────────────────
  if (step===4 && orderNum) return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="w-24 h-24 bg-[#d4f000] rounded-full flex items-center justify-center mx-auto mb-5">
        <Check size={40} className="text-[#0d0d0d]" strokeWidth={3}/>
      </div>
      <h1 className="text-3xl font-extrabold text-[#0d0d0d] mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 text-sm mb-5">
        Thank you, <strong>{ship.firstName}</strong>! We&apos;ve received your order.
      </p>
      <div className="bg-[#f4f4f4] rounded-2xl px-6 py-4 inline-block mb-6">
        <div className="text-xs text-gray-400 font-semibold">Order Number</div>
        <div className="font-mono font-extrabold text-[#0d0d0d] text-xl">{orderNum}</div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 text-left space-y-2 text-sm">
        {[
          ["Confirmation sent to", ship.email],
          ["Shipping to", `${ship.address}, ${ship.city}, ${ship.province} ${ship.postalCode}`],
          ["Delivery method", delivery?.label ?? "Standard"],
          ["Payment", PAYMENT_OPTIONS.find(p=>p.id===pay.method)?.label ?? ""],
          ["Order total", `$${total.toFixed(2)}`],
        ].map(([k,v])=>(
          <div key={k} className="flex justify-between gap-4">
            <span className="text-gray-500">{k}</span>
            <span className="font-bold text-[#0d0d0d] text-right">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account" className="inline-flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-8 py-3.5 rounded-xl hover:bg-[#c4e000]">
          Track Order <ChevronRight size={16}/>
        </Link>
        <Link href="/shop" className="inline-flex items-center gap-2 border-2 border-gray-200 text-[#0d0d0d] font-extrabold px-8 py-3.5 rounded-xl hover:border-[#0d0d0d]">
          Continue Shopping
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-[#0d0d0d]">Home</Link><ChevronRight size={12}/>
        <Link href="/cart" className="hover:text-[#0d0d0d]">Cart</Link><ChevronRight size={12}/>
        <span className="text-[#0d0d0d] font-semibold">Checkout</span>
      </nav>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-8 max-w-md mx-auto">
        {STEPS.map((s,i,arr)=>(
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm transition-all ${step>s.id?"bg-[#d4f000] text-[#0d0d0d]":step===s.id?"bg-[#0d0d0d] text-[#d4f000]":"bg-gray-200 text-gray-400"}`}>
                {step>s.id?<Check size={16} strokeWidth={3}/>:<s.icon size={15}/>}
              </div>
              <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">{s.label}</span>
            </div>
            {i<arr.length-1 && <div className={`w-16 sm:w-20 h-0.5 mx-1 mb-4 transition-all ${step>s.id?"bg-[#d4f000]":"bg-gray-200"}`}/>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">

          {/* ── Step 1: Shipping ── */}
          {step===1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="text-lg font-extrabold text-[#0d0d0d] flex items-center gap-2 pb-3 border-b border-gray-100">
                <Truck size={18}/>Customer &amp; Shipping Information
              </h2>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>{lbl("First Name *")}<input value={ship.firstName} onChange={e=>ss("firstName",e.target.value)} className={ic(shipErrs.firstName)} placeholder="John"/>{fe(shipErrs.firstName)}</div>
                <div>{lbl("Last Name *")}<input value={ship.lastName} onChange={e=>ss("lastName",e.target.value)} className={ic(shipErrs.lastName)} placeholder="Doe"/>{fe(shipErrs.lastName)}</div>
              </div>
              <div>{lbl("Email *")}<input type="email" value={ship.email} onChange={e=>ss("email",e.target.value)} className={ic(shipErrs.email)} placeholder="you@example.com"/>{fe(shipErrs.email)}</div>
              <div>{lbl("Phone")}<input type="tel" value={ship.phone} onChange={e=>ss("phone",e.target.value)} className={ic()} placeholder="+1 (555) 000-0000"/></div>
              <div>{lbl("Street Address *")}<input value={ship.address} onChange={e=>ss("address",e.target.value)} className={ic(shipErrs.address)} placeholder="123 Main St"/>{fe(shipErrs.address)}</div>
              <div>{lbl("Apt / Suite")}<input value={ship.address2} onChange={e=>ss("address2",e.target.value)} className={ic()} placeholder="Optional"/></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">{lbl("Province *")}
                  <select value={ship.province} onChange={e=>ss("province",e.target.value)} className={`${ic(shipErrs.province)} appearance-none`}>
                    <option value="">—</option>{PROVINCES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>{fe(shipErrs.province)}</div>
                <div>{lbl("City *")}<input value={ship.city} onChange={e=>ss("city",e.target.value)} className={ic(shipErrs.city)} placeholder="City"/>{fe(shipErrs.city)}</div>
                <div>{lbl("Postal Code *")}<input value={ship.postalCode} onChange={e=>ss("postalCode",e.target.value)} className={ic(shipErrs.postalCode)} placeholder="48201"/>{fe(shipErrs.postalCode)}</div>
              </div>

              {/* Delivery method */}
              <div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Delivery Method</div>
                <div className="space-y-2">
                  {DELIVERY_OPTIONS.map(d=>(
                    <label key={d.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${ship.deliveryMethod===d.id?"border-[#0d0d0d] bg-[#0d0d0d]/5":"border-gray-200 hover:border-gray-300"}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${ship.deliveryMethod===d.id?"border-[#0d0d0d]":"border-gray-300"}`}>
                        {ship.deliveryMethod===d.id && <div className="w-2 h-2 rounded-full bg-[#0d0d0d]"/>}
                      </div>
                      <input type="radio" value={d.id} checked={ship.deliveryMethod===d.id} onChange={()=>ss("deliveryMethod",d.id)} className="sr-only"/>
                      <d.icon size={16} className="text-gray-500 shrink-0"/>
                      <div className="flex-1">
                        <div className="font-bold text-[#0d0d0d] text-sm">{d.label}</div>
                        <div className="text-xs text-gray-500">{d.time}</div>
                      </div>
                      <div className="font-extrabold text-[#0d0d0d] text-sm shrink-0">
                        {d.price===0?"FREE":`$${d.price.toFixed(2)}`}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={()=>{if(validateShip())setStep(2);}}
                className="w-full flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-3.5 rounded-xl hover:bg-[#c4e000] text-base">
                Continue to Payment <ChevronRight size={17}/>
              </button>
            </div>
          )}

          {/* ── Step 2: Payment ── */}
          {step===2 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-lg font-extrabold text-[#0d0d0d] flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="flex items-center gap-2"><CreditCard size={18}/>Payment Method</span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Lock size={11}/>SSL Secured</span>
              </h2>

              {/* Payment method selection */}
              <div className="space-y-2">
                {PAYMENT_OPTIONS.map(o=>(
                  <label key={o.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${pay.method===o.id?"border-[#0d0d0d] bg-[#0d0d0d]/5":"border-gray-200 hover:border-gray-300"}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${pay.method===o.id?"border-[#0d0d0d]":"border-gray-300"}`}>
                      {pay.method===o.id&&<div className="w-2 h-2 rounded-full bg-[#0d0d0d]"/>}
                    </div>
                    <input type="radio" checked={pay.method===o.id} onChange={()=>sp("method",o.id)} className="sr-only"/>
                    <o.icon size={16} className="text-gray-500 shrink-0"/>
                    <div><div className="font-bold text-[#0d0d0d] text-sm">{o.label}</div><div className="text-xs text-gray-500">{o.desc}</div></div>
                  </label>
                ))}
              </div>

              {/* Card fields */}
              {pay.method==="card" && (
                <div className="space-y-3 pt-1">
                  <div>{lbl("Name on Card")}<input value={pay.cardName} onChange={e=>sp("cardName",e.target.value)} className={ic(payErrs.cardName)} placeholder="John Doe"/>{fe(payErrs.cardName)}</div>
                  <div>{lbl("Card Number")}<input value={pay.cardNumber} onChange={e=>sp("cardNumber",fmt(e.target.value))} maxLength={19} className={ic(payErrs.cardNumber)} placeholder="1234 5678 9012 3456"/>{fe(payErrs.cardNumber)}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>{lbl("Expiry")}<input value={pay.expiry} onChange={e=>sp("expiry",fmtExp(e.target.value))} maxLength={5} className={ic(payErrs.expiry)} placeholder="MM/YY"/>{fe(payErrs.expiry)}</div>
                    <div>{lbl("CVV")}<input value={pay.cvv} onChange={e=>sp("cvv",e.target.value.replace(/\D/g,"").slice(0,4))} maxLength={4} className={ic(payErrs.cvv)} placeholder="123"/>{fe(payErrs.cvv)}</div>
                  </div>
                </div>
              )}

              {pay.method==="cod" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  <strong>Cash on Delivery:</strong> Please have the exact amount ready when your order arrives. Our delivery partner will collect payment.
                </div>
              )}
              {pay.method==="online" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  <strong>Online Payment:</strong> You will be redirected to our secure payment gateway after placing your order to complete bank transfer or e-wallet payment.
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={()=>setStep(1)} className="flex items-center gap-2 border-2 border-gray-200 font-bold px-5 py-3 rounded-xl hover:border-[#0d0d0d] text-sm"><ArrowLeft size={15}/>Back</button>
                <button onClick={()=>{if(validatePay())setStep(3);}} className="flex-1 flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-3 rounded-xl hover:bg-[#c4e000] text-base">
                  Review Order <ChevronRight size={17}/>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step===3 && (
            <div className="space-y-4">
              {/* Shipping summary */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2 font-extrabold text-[#0d0d0d]"><MapPin size={15}/>Shipping To</div><button onClick={()=>setStep(1)} className="text-xs font-bold text-gray-400 hover:text-[#0d0d0d]">Edit</button></div>
                <p className="text-sm font-bold text-[#0d0d0d]">{ship.firstName} {ship.lastName}</p>
                <p className="text-sm text-gray-500">{ship.address}{ship.address2&&`, ${ship.address2}`}, {ship.city}, {ship.province} {ship.postalCode}</p>
                <p className="text-sm text-gray-500">{ship.email} · {ship.phone}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-[#f4f4f4] text-xs font-bold px-2.5 py-1 rounded-full">
                  <Truck size={11}/>{delivery?.label} — {delivery?.time}
                </div>
              </div>

              {/* Payment summary */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2 font-extrabold text-[#0d0d0d]"><CreditCard size={15}/>Payment</div><button onClick={()=>setStep(2)} className="text-xs font-bold text-gray-400 hover:text-[#0d0d0d]">Edit</button></div>
                <p className="text-sm font-semibold text-gray-700">{PAYMENT_OPTIONS.find(p=>p.id===pay.method)?.label}</p>
                {pay.method==="card"&&<p className="text-sm text-gray-500">•••• •••• •••• {pay.cardNumber.replace(/\s/g,"").slice(-4)} · {pay.cardName}</p>}
              </div>

              {/* Items */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 font-extrabold text-[#0d0d0d] mb-4"><Package size={15}/>Order Items ({items.length})</div>
                <div className="space-y-3">
                  {items.map(({product:p,quantity:q})=>(
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0"><Image src={p.thumbnail} alt={p.name} fill className="object-cover" sizes="48px"/></div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-bold text-[#0d0d0d] line-clamp-1">{p.name}</p><p className="text-xs text-gray-400">Qty {q} · SKU: {p.sku}</p></div>
                      <span className="font-extrabold text-[#0d0d0d] text-sm">${(p.price*q).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="flex items-center gap-2 border-2 border-gray-200 font-bold px-5 py-3 rounded-xl hover:border-[#0d0d0d] text-sm"><ArrowLeft size={15}/>Back</button>
                <button onClick={placeOrder} disabled={placing||items.length===0}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold py-3.5 rounded-xl hover:bg-[#c4e000] disabled:opacity-60 text-base">
                  {placing?<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Placing…</>:<><Lock size={15}/>Place Order · ${total.toFixed(2)}</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <h2 className="font-extrabold text-[#0d0d0d] mb-4 pb-3 border-b border-gray-100">Order Summary</h2>
            <div className="space-y-2.5 max-h-52 overflow-y-auto mb-4">
              {items.map(({product:p,quantity:q})=>(
                <div key={p.id} className="flex items-center gap-2.5">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                    <Image src={p.thumbnail} alt={p.name} fill className="object-cover" sizes="40px"/>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0d0d0d] rounded-full text-[9px] font-bold text-white flex items-center justify-center">{q}</div>
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-bold text-[#0d0d0d] line-clamp-1">{p.name}</p><p className="text-[10px] text-gray-400">{p.brand}</p></div>
                  <span className="text-xs font-extrabold text-[#0d0d0d] shrink-0">${(p.price*q).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="font-bold">{shipCost===0?"FREE":`$${shipCost.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax (8%)</span><span className="font-bold">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-extrabold text-[#0d0d0d] text-base border-t border-gray-100 pt-3"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck size={13} className="text-green-500"/>SSL encrypted secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
