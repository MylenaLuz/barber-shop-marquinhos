import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Espaco from "../components/Espaco";
import Gallery from "../components/Gallery";
import Barbers from "../components/Barbers";
import Services from "../components/Services";
import MarquinhosClub from "../components/MarquinhosClub";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import MapContact from "../components/MapContact";
import Footer from "../components/Footer";
import BookingModal from "../components/BookingModal";
import JoinClubModal from "../components/JoinClubModal";
import { useSiteData } from "../context/SiteDataContext";

export default function Home() {
  const { loading } = useSiteData();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialBarberId, setInitialBarberId] = useState(null);
  const [joinPlan, setJoinPlan] = useState(null);

  function openBooking(barberId) {
    setInitialBarberId(barberId || null);
    setBookingOpen(true);
  }

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--silver-dim)" }} className="mono">carregando…</div>;
  }

  return (
    <>
      <Navbar onBook={() => openBooking(null)} />
      <Hero onBook={() => openBooking(null)} />
      <About />
      <Espaco />
      <Gallery />
      <Barbers onBookWith={(id) => openBooking(id)} />
      <Services onBook={() => openBooking(null)} />
      <MarquinhosClub onJoin={(plan) => setJoinPlan(plan)} />
      <HowItWorks onBook={() => openBooking(null)} />
      <Testimonials />
      <MapContact />
      <Footer />

      <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 60 }} className="float-cta">
        <button className="btn btn-gold" onClick={() => openBooking(null)}>Agendar horário</button>
      </div>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} initialBarberId={initialBarberId} />
      <JoinClubModal plan={joinPlan} onClose={() => setJoinPlan(null)} />
      <style>{`@media (max-width: 640px){ .float-cta{ display:none; } }`}</style>
    </>
  );
}
