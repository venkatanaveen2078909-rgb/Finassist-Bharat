import { useNavigate } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import AnimatedBackground from "../components/background/AnimatedBackground";
import ChatPreview from "../components/home/ChatPreview";

function Home() {
  

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <AnimatedBackground />

      <Navbar />

      <Hero />

      <ChatPreview />

      <Categories />

      
    </div>
  );
}

export default Home;