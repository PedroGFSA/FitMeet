import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";

interface CustomAlertProps {
  title: string;
  description: string;
  variant: "default" | "destructive";
  success: boolean;
  timer?: number;
  onClose?: (b : boolean) => void;
}

export const CustomAlert = ({ title, description, variant = "default", success = false, timer = 3000, onClose }: CustomAlertProps) => {
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowAlert(false);
      if (onClose) {
        onClose(showAlert);
      }
    }, timer);
  }, [timer, onClose, showAlert]);

  return (
    <Alert variant={variant} className={`${showAlert ? "opacity-100" : "opacity-0 pointer-events-none"} max-w-md absolute top-5 left-1/2 -translate-x-1/2 transition-all duration-300 slide-from-top`}>
      <AlertTitle className={success ? "text-green-600 relative" : "text-red-600 relative"}>{title} <span className="absolute right-0 top-0 text-neutral-400 font-bold text-2xl/6 hover:cursor-pointer hover:transition-all hover:duration-200 hover:text-neutral-500" onClick={() => setShowAlert(false)}>&times;</span></AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};