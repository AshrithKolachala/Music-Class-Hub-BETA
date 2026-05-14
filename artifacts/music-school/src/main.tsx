import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { seedIfEmpty } from "@/lib/db/seed";

seedIfEmpty();

createRoot(document.getElementById("root")!).render(<App />);
