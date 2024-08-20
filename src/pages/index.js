import React, { useEffect } from "react";
import SignupLogin from "../../Components/SignupLogin/SignupLogin";
import CreateWallet from "../../Components/CreateWallet/CreateWallet";

export default function Home() {
  useEffect(() => {
    const tele = window.Telegram.WebApp;
    console.log(tele);
    if (tele) {
      tele.ready();
      tele.expand();
      tele.viewportStableHeight    
   }
  }, []);

  return (
    <div>
      {/* <SignupLogin/> */}
      <CreateWallet/>
    </div>
  );
}
