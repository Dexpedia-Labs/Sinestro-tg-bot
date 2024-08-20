import { useEffect, useState } from "react";

function useKeyboardAdjust() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        const bottom = e.target.getBoundingClientRect().bottom;
        const viewportHeight = window.innerHeight;
        if (bottom > viewportHeight) {
          setKeyboardHeight(bottom - viewportHeight + 20);
        }
      }
    };

    const handleBlur = () => {
      setKeyboardHeight(0);
    };

    window.addEventListener("focusin", handleFocus);
    window.addEventListener("focusout", handleBlur);

    return () => {
      window.removeEventListener("focusin", handleFocus);
      window.removeEventListener("focusout", handleBlur);
    };
  }, []);

  return keyboardHeight;
}

export default useKeyboardAdjust;
