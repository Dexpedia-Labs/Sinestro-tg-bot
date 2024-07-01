import React, { useEffect } from "react";
import SignupLogin from "../../Components/SignupLogin/SignupLogin";

export default function Home() {
  useEffect(() => {
    const tele = window.Telegram.WebApp;
    if (tele) {
      tele.ready();
      tele.expand();
      tele.viewportStableHeight    
   }
  }, []);

  return (
    <div>
      <SignupLogin/>
    </div>
  );
}
