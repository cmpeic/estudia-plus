"use client";

import dynamic from "next/dynamic";
import { useEffect, type ComponentType } from "react";
import { markLab } from "@/lib/store";
import { SORT_SETS } from "./sort-data";

function Loading() {
  return <div className="h-64 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />;
}

const SortGame = dynamic(() => import("./SortGame"), { loading: Loading });
const MvcFlow = dynamic(() => import("@/components/diagrams/arquitectura").then((m) => m.MvcFlow), { loading: Loading });
const EnvStack = dynamic(() => import("@/components/diagrams/entornos").then((m) => m.EnvStack), { loading: Loading });

const CUSTOM: Record<string, ComponentType> = {
  "mvc-flow": () => <MvcFlow showPicker />,
  "env-stack": () => <EnvStack simulate />,
  "deploy-sim": dynamic(() => import("./other-labs").then((m) => m.DeploySim), { loading: Loading }),
  "qr-inspector": dynamic(() => import("./other-labs").then((m) => m.QrInspector), { loading: Loading }),
  "url-detective": dynamic(() => import("./other-labs").then((m) => m.UrlDetective), { loading: Loading }),
  "order-sim": dynamic(() => import("./other-labs").then((m) => m.OrderSim), { loading: Loading }),
  "uc-builder": dynamic(() => import("./other-labs").then((m) => m.UcBuilder), { loading: Loading }),
  "sus-calculator": dynamic(() => import("./other-labs").then((m) => m.SusCalculator), { loading: Loading }),
  "subnet-calc": dynamic(() => import("./ip-labs").then((m) => m.SubnetCalc), { loading: Loading }),
  "subnet-practice": dynamic(() => import("./ip-labs").then((m) => m.SubnetPractice), { loading: Loading }),
  "ip-binary": dynamic(() => import("./ip-labs").then((m) => m.IpBinary), { loading: Loading }),
  "ip-classifier": dynamic(() => import("./ip-labs").then((m) => m.IpClassifier), { loading: Loading }),
  "ipv6-lab": dynamic(() => import("./ip-labs").then((m) => m.Ipv6Lab), { loading: Loading }),
  "nat-sim": dynamic(() => import("./net-labs").then((m) => m.NatSim), { loading: Loading }),
  "net-terminal": dynamic(() => import("./net-labs").then((m) => m.NetTerminal), { loading: Loading }),
};

export default function LabView({ id }: { id: string }) {
  useEffect(() => {
    // Los laboratorios de exploración cuentan como hechos al abrirlos
    if (id === "mvc-flow" || id === "env-stack") markLab(id);
  }, [id]);
  if (SORT_SETS[id]) return <SortGame labId={id} />;
  const C = CUSTOM[id];
  if (!C) return <p className="text-sm text-muted">Laboratorio no disponible.</p>;
  return <C />;
}
