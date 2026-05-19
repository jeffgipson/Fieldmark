import { useState } from "react";
import SalesChat from "./SalesChat";
import SalesChatBubble from "./SalesChatBubble";

export default function SalesChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SalesChatBubble onClick={() => setOpen((o) => !o)} open={open} />
      <SalesChat open={open} onClose={() => setOpen(false)} />
    </>
  );
}
