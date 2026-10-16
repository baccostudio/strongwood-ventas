import ThankYouLanding from "@/components/landing/ThankYouLanding";

export const metadata = {
  alternates: { canonical: "/STRONGWOOD_COCINAS/thankyou" },
  robots: { index: false, follow: true },
  title: "Gracias - StrongWood",
  description: "Página de agradecimiento luego del envío del diagnóstico de StrongWood.",
};

const ThankYouPage = () => {
  return <ThankYouLanding />;
};

export default ThankYouPage;
