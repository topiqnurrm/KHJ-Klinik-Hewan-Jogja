import React from "react";
import Hp1 from "./contents/hp1/hp1";
import Hp2 from "./contents/hp2/hp2";
import Hp3 from "./contents/hp3/hp3";
import Hp4 from "./contents/hp4/hp4";
import Hp5 from "./contents/hp5/hp5";
import "./HomePage.css";

function HomePage({ identity }) {
  return (
    <div className="homeprime">
      <Hp1 />
      <Hp2 />
      <Hp3 />
      <Hp4 identity={identity} />  {/* Di sini letaknya setelah panduan */}
      <Hp5 />
    </div>
  );
}

export default HomePage;
