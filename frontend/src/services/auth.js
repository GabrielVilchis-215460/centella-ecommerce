import axios from "axios"

//const API_URL = import.meta.env.VITE_API_URL // nohayenv como nohayfron ＞﹏＜
const API_URL = "http://localhost:8000" //TODO: remove hardcoded ref and add .env

export const authService = {

  login: async (email, contrasena) => {
    const { data } = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email,
      contrasena,
    })
    return data
  },

  registro: async (datosUsuario) => {
    const { data } = await axios.post(`${API_URL}/api/v1/auth/registro`, datosUsuario)
    return data
  },

}