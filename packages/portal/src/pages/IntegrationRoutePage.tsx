import { Navigate, useParams } from "react-router-dom";
import { IntegrationPage } from "../components/marketing/IntegrationPage";
import { INTEGRATIONS } from "../lib/integrations";

export function IntegrationRoutePage() {
  const { slug } = useParams<{ slug: string }>();
  const config = slug ? INTEGRATIONS[slug] : undefined;
  if (!config) return <Navigate to="/developers/how-it-works" replace />;
  return <IntegrationPage config={config} />;
}
