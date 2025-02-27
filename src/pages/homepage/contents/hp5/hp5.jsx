import './hp5.css';
import logo from './gambar/logo.png'; // Import logo
import contact1 from './gambar/contact1.png'; // Ikon email
import contact2 from './gambar/contact2.png'; // Ikon telepon
import contact3 from './gambar/contact3.png'; // Ikon alamat
import social1 from './gambar/social1.png'; // Instagram
import social2 from './gambar/social2.png'; // Facebook
import social3 from './gambar/social3.png'; // Twitter

function Hp5() {
  return (
    <section id="hp5" className="hp5">
      <div className="content-wrapper">
        {/* Logo & Judul */}
        <div className="logo-section">
          <img src={logo} alt="Logo Klinik" className="clinic-logo" />
          <h2 className="clinic-name">Klinik Hewan <br /> Kota Jogja</h2>
        </div>

        {/* Kontak */}
        <div className="contact-section">
          <h3>Kontak</h3>
          <div className="contact-item">
            <img src={contact1} alt="Email" />
            <p>klikhewanjogja@gmail.com</p>
          </div>
          <div className="contact-item">
            <img src={contact2} alt="Telepon" />
            <p>(0274) 968515</p>
          </div>
          <div className="contact-item">
            <img src={contact3} alt="Alamat" />
            <p>Jl. Kenari No.56, Kota Yogyakarta <br /> (Komplek Balaikota Yogyakarta) <br /> Kodepos 55165</p>
          </div>
        </div>

        {/* Sosial Media dengan Link */}
        <div className="social-section">
          <h3>Sosial Media</h3>
          <div className="social-item">
            <a href="https://www.instagram.com/klinik.hewan.jogia" target="_blank" rel="noopener noreferrer">
              <img src={social1} alt="Instagram" className="social-icon" />
            </a>
            <p>@klinik.hewan.jogia</p>
          </div>
          <div className="social-item">
            <a href="https://www.facebook.com/klinik.hewan.jogia" target="_blank" rel="noopener noreferrer">
              <img src={social2} alt="Facebook" className="social-icon" />
            </a>
            <p>@klinik.hewan.jogia</p>
          </div>
          <div className="social-item">
            <a href="https://twitter.com/klinik.hewan.jogia" target="_blank" rel="noopener noreferrer">
              <img src={social3} alt="Twitter" className="social-icon" />
            </a>
            <p>@klinik.hewan.jogia</p>
          </div>
        </div>
      </div>

      {/* Garis Horizontal & Copyright */}
      <hr className="divider" />
      <p className="copyright">© 2025 KHJ Kota Yogyakarta. Semua Hak Dilindungi</p>
    </section>
  );
}

export default Hp5;
