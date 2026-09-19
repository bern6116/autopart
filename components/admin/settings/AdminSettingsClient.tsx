"use client";
import { useState } from "react";
import { Check, Building2, DollarSign, Truck, CreditCard, Bell, Shield } from "lucide-react";

type Tab = "business"|"currency"|"shipping"|"payment"|"notifications"|"security";

const TABS: { id: Tab; icon: typeof Building2; label: string }[] = [
  { id:"business",      icon:Building2,  label:"Business Info" },
  { id:"currency",      icon:DollarSign, label:"Currency & Tax" },
  { id:"shipping",      icon:Truck,      label:"Shipping" },
  { id:"payment",       icon:CreditCard, label:"Payment Methods" },
  { id:"notifications", icon:Bell,       label:"Notifications" },
  { id:"security",      icon:Shield,     label:"Security" },
];

export default function AdminSettingsClient() {
  const [tab, setTab] = useState<Tab>("business");
  const [saved, setSaved] = useState(false);
  const [biz, setBiz] = useState({ name:"Auto Core", email:"support@autocore.com", phone:"1-800-AUTO-CORE", address:"4821 Industrial Blvd", city:"Detroit", state:"MI", zip:"48201", country:"USA", logo:"", website:"https://autocore.com" });
  const [curr, setCurr] = useState({ currency:"USD", symbol:"$", taxRate:"8", taxName:"Sales Tax", taxIncluded:false });
  const [ship, setShip] = useState({ standard:"9.99", express:"19.99", overnight:"39.99", freeThreshold:"75", enableFree:true });
  const [pay, setPay] = useState({ cash:true, card:true, online:true, cod:true, other:false });
  const [notif, setNotif] = useState({ lowStock:true, newOrder:true, orderStatus:true, newCustomer:true, systemUpdates:false });
  const [sec, setSec] = useState({ twoFactor:false, sessionTimeout:"60", passwordPolicy:"strong", loginAttempts:"5" });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const ic = "w-full bg-[#f4f4f4] border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]";
  const lbl = (t: string) => <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">{t}</label>;
  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button type="button" onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors ${on?"bg-[#0d0d0d]":"bg-gray-200"}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${on?"left-6":"left-1"}`}/>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#0d0d0d]">Settings</h1>
        {saved && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2 text-sm"><Check size={14}/>Settings saved!</div>}
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <aside className="hidden md:block w-52 shrink-0 bg-white rounded-2xl border border-gray-100 p-2 self-start sticky top-24">
          {TABS.map(({ id, icon:Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab===id?"bg-[#0d0d0d] text-[#d4f000]":"text-gray-600 hover:bg-[#f4f4f4] hover:text-[#0d0d0d]"}`}>
              <Icon size={15}/>{label}
            </button>
          ))}
        </aside>
        {/* Mobile tabs */}
        <div className="md:hidden flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)} className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${tab===id?"bg-[#0d0d0d] text-white border-[#0d0d0d]":"border-gray-200 text-gray-600"}`}>{label}</button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {tab === "business" && (
            <>
              <h2 className="font-extrabold text-[#0d0d0d] text-lg pb-3 border-b border-gray-100">Business Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="col-span-2">{lbl("Business Name")}<input value={biz.name} onChange={e=>setBiz({...biz,name:e.target.value})} className={ic}/></div>
                <div>{lbl("Email")}<input type="email" value={biz.email} onChange={e=>setBiz({...biz,email:e.target.value})} className={ic}/></div>
                <div>{lbl("Phone")}<input value={biz.phone} onChange={e=>setBiz({...biz,phone:e.target.value})} className={ic}/></div>
                <div className="col-span-2">{lbl("Street Address")}<input value={biz.address} onChange={e=>setBiz({...biz,address:e.target.value})} className={ic}/></div>
                <div>{lbl("City")}<input value={biz.city} onChange={e=>setBiz({...biz,city:e.target.value})} className={ic}/></div>
                <div>{lbl("State")}<input value={biz.state} onChange={e=>setBiz({...biz,state:e.target.value})} className={ic}/></div>
                <div>{lbl("ZIP Code")}<input value={biz.zip} onChange={e=>setBiz({...biz,zip:e.target.value})} className={ic}/></div>
                <div>{lbl("Country")}<input value={biz.country} onChange={e=>setBiz({...biz,country:e.target.value})} className={ic}/></div>
                <div>{lbl("Website")}<input value={biz.website} onChange={e=>setBiz({...biz,website:e.target.value})} className={ic}/></div>
                <div>{lbl("Logo URL")}<input value={biz.logo} onChange={e=>setBiz({...biz,logo:e.target.value})} className={ic} placeholder="https://…"/></div>
              </div>
            </>
          )}
          {tab === "currency" && (
            <>
              <h2 className="font-extrabold text-[#0d0d0d] text-lg pb-3 border-b border-gray-100">Currency & Tax</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>{lbl("Currency")}<select value={curr.currency} onChange={e=>setCurr({...curr,currency:e.target.value})} className={`${ic} appearance-none`}><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option><option value="GBP">GBP — British Pound</option><option value="CAD">CAD — Canadian Dollar</option></select></div>
                <div>{lbl("Currency Symbol")}<input value={curr.symbol} onChange={e=>setCurr({...curr,symbol:e.target.value})} className={ic}/></div>
                <div>{lbl("Tax Name")}<input value={curr.taxName} onChange={e=>setCurr({...curr,taxName:e.target.value})} className={ic}/></div>
                <div>{lbl("Tax Rate (%)")}<input type="number" value={curr.taxRate} onChange={e=>setCurr({...curr,taxRate:e.target.value})} className={ic}/></div>
                <div className="col-span-2 flex items-center justify-between p-4 bg-[#f9f9f9] rounded-xl">
                  <div><div className="font-semibold text-sm text-[#0d0d0d]">Tax Included in Prices</div><div className="text-xs text-gray-400">Show tax-inclusive pricing</div></div>
                  <Toggle on={curr.taxIncluded} onToggle={()=>setCurr({...curr,taxIncluded:!curr.taxIncluded})}/>
                </div>
              </div>
            </>
          )}
          {tab === "shipping" && (
            <>
              <h2 className="font-extrabold text-[#0d0d0d] text-lg pb-3 border-b border-gray-100">Shipping Rates</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>{lbl("Standard Shipping ($)")}<input type="number" value={ship.standard} onChange={e=>setShip({...ship,standard:e.target.value})} className={ic}/></div>
                <div>{lbl("Express Shipping ($)")}<input type="number" value={ship.express} onChange={e=>setShip({...ship,express:e.target.value})} className={ic}/></div>
                <div>{lbl("Overnight Shipping ($)")}<input type="number" value={ship.overnight} onChange={e=>setShip({...ship,overnight:e.target.value})} className={ic}/></div>
                <div>{lbl("Free Shipping Threshold ($)")}<input type="number" value={ship.freeThreshold} onChange={e=>setShip({...ship,freeThreshold:e.target.value})} className={ic}/></div>
                <div className="col-span-2 flex items-center justify-between p-4 bg-[#f9f9f9] rounded-xl">
                  <div><div className="font-semibold text-sm text-[#0d0d0d]">Enable Free Shipping</div><div className="text-xs text-gray-400">Free above threshold</div></div>
                  <Toggle on={ship.enableFree} onToggle={()=>setShip({...ship,enableFree:!ship.enableFree})}/>
                </div>
              </div>
            </>
          )}
          {tab === "payment" && (
            <>
              <h2 className="font-extrabold text-[#0d0d0d] text-lg pb-3 border-b border-gray-100">Payment Methods</h2>
              <div className="space-y-3">
                {[["Cash on Delivery","Accept cash payments on delivery","cod"],["Credit/Debit Card","Accept Visa, MC, AMEX","card"],["Online Payment","Bank transfer, digital wallets","online"],["Pay at Pickup","For store pickup orders","cash"],["Other Methods","Gift cards, store credit","other"]].map(([title,desc,key]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-[#f9f9f9] rounded-xl">
                    <div><div className="font-semibold text-sm text-[#0d0d0d]">{title}</div><div className="text-xs text-gray-400">{desc}</div></div>
                    <Toggle on={pay[key as keyof typeof pay]} onToggle={()=>setPay({...pay,[key]:!pay[key as keyof typeof pay]})}/>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "notifications" && (
            <>
              <h2 className="font-extrabold text-[#0d0d0d] text-lg pb-3 border-b border-gray-100">Notification Settings</h2>
              <div className="space-y-3">
                {[["Low Stock Alert","Notify when products reach reorder level","lowStock"],["New Order","Notify on every new customer order","newOrder"],["Order Status Change","Notify on order status updates","orderStatus"],["New Customer","Notify when a new customer registers","newCustomer"],["System Updates","Platform and security updates","systemUpdates"]].map(([title,desc,key]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-[#f9f9f9] rounded-xl">
                    <div><div className="font-semibold text-sm text-[#0d0d0d]">{title}</div><div className="text-xs text-gray-400">{desc}</div></div>
                    <Toggle on={notif[key as keyof typeof notif]} onToggle={()=>setNotif({...notif,[key]:!notif[key as keyof typeof notif]})}/>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "security" && (
            <>
              <h2 className="font-extrabold text-[#0d0d0d] text-lg pb-3 border-b border-gray-100">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#f9f9f9] rounded-xl">
                  <div><div className="font-semibold text-sm text-[#0d0d0d]">Two-Factor Authentication</div><div className="text-xs text-gray-400">Require 2FA for all admin logins</div></div>
                  <Toggle on={sec.twoFactor} onToggle={()=>setSec({...sec,twoFactor:!sec.twoFactor})}/>
                </div>
                <div>{lbl("Session Timeout (minutes)")}<input type="number" value={sec.sessionTimeout} onChange={e=>setSec({...sec,sessionTimeout:e.target.value})} className={ic}/></div>
                <div>{lbl("Max Login Attempts")}<input type="number" value={sec.loginAttempts} onChange={e=>setSec({...sec,loginAttempts:e.target.value})} className={ic}/></div>
                <div>{lbl("Password Policy")}<select value={sec.passwordPolicy} onChange={e=>setSec({...sec,passwordPolicy:e.target.value})} className={`${ic} appearance-none`}>
                  <option value="basic">Basic (8+ characters)</option>
                  <option value="strong">Strong (uppercase, numbers, symbols)</option>
                  <option value="very_strong">Very Strong (12+ complex characters)</option>
                </select></div>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-gray-100">
            <button onClick={handleSave} className="flex items-center gap-2 bg-[#d4f000] text-[#0d0d0d] font-extrabold px-6 py-2.5 rounded-xl hover:bg-[#c4e000] text-sm">
              <Check size={15}/>Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
