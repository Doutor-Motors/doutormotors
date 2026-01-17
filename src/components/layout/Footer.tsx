import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/images/logo-new-car.png";
import facebookIcon from "@/assets/images/facebook.svg";
import instagramIcon from "@/assets/images/instagram.svg";
import twitterIcon from "@/assets/images/twitter.svg";
import footerShape1 from "@/assets/images/footer-shape-1.png";
import footerShape2 from "@/assets/images/footer-shape-2.png";
import footerShape3 from "@/assets/images/footer-shape-3.png";

const Footer = () => {
  return (
    <footer className="text-white/90">
      <div className="bg-dm-space py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-10 relative z-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex flex-col items-start mb-4">
              <img src={logo} alt="Doutor Motors" className="h-[100px] w-auto object-contain" />
              <span className="font-chakra text-primary-foreground text-lg font-bold tracking-wider -mt-[29px]">DOUTOR MOTORS</span>
            </Link>
            <p className="text-white/80 mb-5 text-sm leading-relaxed">
              Doutor Motors é seu diagnóstico automotivo inteligente. 
              Entenda os problemas do seu veículo e saiba como resolver.
            </p>
            <div className="flex gap-2">
              <a href="#" className="bg-dm-blue-3 p-3 rounded-full hover:bg-primary hover:-translate-y-1 transition-all">
                <img src={facebookIcon} alt="Facebook" className="w-5 h-5" />
              </a>
              <a href="#" className="bg-dm-blue-3 p-3 rounded-full hover:bg-primary hover:-translate-y-1 transition-all">
                <img src={instagramIcon} alt="Instagram" className="w-5 h-5" />
              </a>
              <a href="#" className="bg-dm-blue-3 p-3 rounded-full hover:bg-primary hover:-translate-y-1 transition-all">
                <img src={twitterIcon} alt="Twitter" className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="font-chakra uppercase text-primary-foreground text-lg mb-4">Suporte</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
              </li>
              <li>
                <Link to="/privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-primary transition-colors">Contato</Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-chakra uppercase text-primary-foreground text-lg mb-4">Contato</h3>
            <ul className="space-y-4">
              <li>
                <a href="tel:+5511999999999" className="flex items-center gap-3 hover:text-primary transition-colors">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>+55 11 99999-9999</span>
                </a>
              </li>
              <li>
                <a href="mailto:contato@doutormotors.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>contato@doutormotors.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span>São Paulo, SP - Brasil</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative Shape */}
        <img 
          src={footerShape3} 
          alt="" 
          className="hidden lg:block absolute right-0 bottom-0 w-1/3 move-anim opacity-50" 
        />
      </div>

      {/* Bottom Bar */}
      <div className="bg-dm-blue-1 py-5 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <p className="text-center text-xs text-white/70">
            Copyright © {new Date().getFullYear()} Doutor Motors. Todos os direitos reservados. 
            <span className="mx-2">|</span>
            <span className="italic">Plataforma informativa e educativa.</span>
          </p>
        </div>
        <img 
          src={footerShape2} 
          alt="" 
          className="hidden lg:block absolute right-0 bottom-0 w-1/3 opacity-30" 
        />
        <img 
          src={footerShape1} 
          alt="" 
          className="hidden lg:block absolute left-10 bottom-0 w-1/4 move-anim opacity-40" 
        />
      </div>
    </footer>
  );
};

export default Footer;
