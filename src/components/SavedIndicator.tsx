import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface SavedIndicatorProps {
  trigger: number; // increment to show
}

const SavedIndicator = ({ trigger }: SavedIndicatorProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!visible) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-success animate-fade-in ml-2 transition-opacity">
      <Check className="h-3 w-3" />
      Saved
    </span>
  );
};

export default SavedIndicator;
