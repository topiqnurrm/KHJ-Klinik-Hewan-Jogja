import React from "react";
import NavBar from "../../components/navbar/NavBar";
import Hp1 from "./contents/hp1";
import Hp2 from "./contents/hp2";
import Hp3 from "./contents/hp3";
import Hp4 from "./contents/hp4";
import Hp5 from "./contents/hp5";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="homeprime">
      <Hp1 />
      <Hp2 />
      <Hp3 />
      <Hp4 />
      <Hp5 />
    </div>
  );
}

export default HomePage;
