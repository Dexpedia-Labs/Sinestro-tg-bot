import React, { useEffect } from "react";
import CreateWallet from "../../Components/CreateWallet/CreateWallet";

export default function Home() {
  useEffect(() => {
    const tele = window.Telegram.WebApp;
    if (tele) {
      tele.ready();
      tele.expand();
      tele.viewportStableHeight    
      console.log(window.Telegram.WebApp);
   }
  }, []);

  return (
    <div>
      <CreateWallet />
    </div>
  );
}
