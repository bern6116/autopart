import { Car, PackageCheck, WalletCards } from "lucide-react";

const services = [
  { icon: Car, title: "Vehicle fitment search", description: "Uses recorded compatibility data" },
  { icon: PackageCheck, title: "Stock checked at checkout", description: "Availability is validated before ordering" },
  { icon: WalletCards, title: "Cash on delivery", description: "Current supported checkout method" },
];

export default function ServiceStrip() {
  return (
    <section className="border-t border-gray-200 bg-[#f7f7f7]" aria-label="Store services">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-7 sm:px-6 md:grid-cols-3">
        {services.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d4f000] text-[#0d0d0d]"><Icon aria-hidden="true" size={19}/></span>
            <div><h2 className="text-sm font-extrabold text-[#0d0d0d]">{title}</h2><p className="mt-0.5 text-xs leading-5 text-gray-600">{description}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
