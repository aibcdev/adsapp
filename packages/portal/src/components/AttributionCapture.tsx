import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureAttributionFromUrl } from "../lib/attribution";
import { capturePartnerFromUrl } from "../lib/partnerRef";

export function AttributionCapture() {
  const location = useLocation();

  useEffect(() => {
    captureAttributionFromUrl(location.search, location.pathname);
    capturePartnerFromUrl(location.search);
  }, [location.search, location.pathname]);

  return null;
}
