import { useState } from "react";
import "./hp4.css";

function Hp4() {
  const [activePage, setActivePage] = useState("page1");

  return (
    <section id="hp4" className="hp4">
      <div className="content-wrapper">
        {/* Tombol Navigasi */}
        <nav className="navigation">
          <button onClick={() => setActivePage("page1")}>Page 1s</button>
          <button onClick={() => setActivePage("page2")}>Page 2d</button>
          <button onClick={() => setActivePage("page3")}>Page 3</button>
          <button onClick={() => setActivePage("page4")}>Page 4</button>
        </nav>

        {/* Halaman yang Ditampilkan */}
        {activePage === "page1" && <Page1 />}
        {activePage === "page2" && <Page2 />}
        {activePage === "page3" && <Page3 />}
        {activePage === "page4" && <Page4 />}
      </div>
    </section>
  );
}

// Komponen Halaman
function Page1() {
  return <div className="page">Ini Halaman 1</div>;
}

function Page2() {
  return <div className="page">Ini Halaman 2</div>;
}

function Page3() {
  return <div className="page">Ini Halaman 3</div>;
}

function Page4() {
  return <div className="page">Ini Halaman 4</div>;
}

export default Hp4;
