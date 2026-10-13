import { Navigate, useParams } from "react-router-dom";
import { resolveMask } from "@/lib/routeMask";
import NotFound from "./NotFound";

export default function MaskedRoute() {
  const { token } = useParams();
  const real = token ? resolveMask(token) : null;
  if (!real) return <NotFound />;
  return <Navigate to={real} replace />;
}
