import api from "./axios"

export const enviosService = {
  cotizar: (destino, paquete) =>
    api.post("/api/v1/envios/cotizar", {
      destino,
      paquete,
      carrier: "fedex",
    }),
}