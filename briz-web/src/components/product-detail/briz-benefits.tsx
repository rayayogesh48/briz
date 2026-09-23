import { MapPin, MessageSquare, Truck } from "lucide-react";

export function BrizBenefits() {
  const benefits = [
    {
      title: "Shop nearby",
      description:
        "Discover products from local stores and see how far they are from you.",
      icon: MapPin,
    },
    {
      title: "Talk to the store",
      description:
        "Ask about availability and confirm product details directly with the seller.",
      icon: MessageSquare,
    },
    {
      title: "Choose how you shop",
      description:
        "Explore delivery and store pickup options offered by each store.",
      icon: Truck,
    },
  ];

  return (
    <section
      aria-labelledby="why-shop-heading"
      className="flex flex-col gap-3 rounded-2xl border border-[#ebebeb] bg-[#f9fafb] p-5 shadow-xs"
    >
      <h2
        id="why-shop-heading"
        className="text-sm font-bold uppercase tracking-wider text-slate-400"
      >
        Why shop on Briz?
      </h2>

      <div className="flex flex-col gap-2.5">
        {benefits.map((benefit) => {
          const IconComponent = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="flex items-start gap-3 rounded-xl bg-white p-3.5 border border-[#ebebeb] shadow-xs"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#eff4ff] text-[#3e63dd]">
                <IconComponent className="h-4 w-4 stroke-[2.2]" />
              </div>

              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold text-[#202020]">
                  {benefit.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#646464]">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
