export interface Guide {
  slug: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  sections: Array<{ heading: string; body: string }>;
}

export const guides: Guide[] = [
  {
    slug: "choose-the-right-brake-pads",
    title: "How to Choose the Right Brake Pads",
    summary: "Compare common brake-pad materials and confirm fitment before ordering replacements.",
    image: "/Product/bosch-quietcast-bc905.webp",
    imageAlt: "Brake pad set used to illustrate brake-pad selection",
    sections: [
      { heading: "Start with fitment", body: "Use the vehicle year, make, model, engine, and axle position to narrow the catalog. A similar shape does not confirm compatibility." },
      { heading: "Compare materials", body: "Ceramic pads generally prioritize low dust and quiet operation. Semi-metallic pads often tolerate heat well but may produce more noise and dust." },
      { heading: "Inspect the full system", body: "Check rotor condition, hardware, caliper movement, and brake-fluid condition before replacing pads. Follow the vehicle manufacturer's service procedure." },
    ],
  },
  {
    slug: "suspension-warning-signs",
    title: "Suspension Warning Signs to Check",
    summary: "Recognize common symptoms and arrange a proper inspection before replacing components.",
    image: "/Product/monroe-172631-strut.webp",
    imageAlt: "Illustrative strut assembly for a suspension inspection guide",
    sections: [
      { heading: "Changes in ride quality", body: "Excessive bouncing, knocking noises, uneven tire wear, or pulling can indicate a suspension or alignment issue." },
      { heading: "Inspect before ordering", body: "Several components can cause similar symptoms. Confirm the failed part and its installation position before buying a replacement." },
      { heading: "Safety first", body: "Suspension work can involve stored spring energy and critical fasteners. Use the correct tools and qualified help when needed." },
    ],
  },
  {
    slug: "engine-oil-filter-basics",
    title: "Engine Oil Filter Basics",
    summary: "Understand why filter specifications and service intervals matter for engine protection.",
    image: "/Product/acdelco-pf64-oil-filter.webp",
    imageAlt: "Oil filter used to illustrate an engine oil-filter guide",
    sections: [
      { heading: "Match the specification", body: "Thread size, sealing diameter, bypass-valve setting, and filter dimensions must match the vehicle application." },
      { heading: "Follow the service schedule", body: "Use the oil grade and replacement interval stated in the vehicle owner's manual, adjusting for severe operating conditions when specified." },
      { heading: "Check after installation", body: "Confirm the old gasket was removed, lubricate the new gasket as directed, tighten correctly, and inspect for leaks after starting the engine." },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
