import { Header } from '../components/layout/Header';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default {
  title: 'Componentes/Layout/Header',
  component: Header,
};

const mockCartBase = {
  totalPagar: 0,
  cargando: false,
  cargarCarrito: async () => {}, 
  agregarItem: async () => {},
  eliminarItem: async () => {},
  actualizarCantidad: async () => {},
};

export const VistaClienteConCarrito = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider value={{ 
          usuario: { nombre: 'Gabriel', tipo_usuario: 'cliente' }, 
          esCliente: () => true,
          esEmprendedora: () => false,
          estaAutenticado: () => true 
        }}>
          {/* Aquí le pasamos un par de items falsos para ver el contador */}
          <CartContext.Provider value={{ 
            ...mockCartBase, 
            items: [{ id: 1, nombre: 'Producto 1', cantidad: 2 }, { id: 2, nombre: 'Producto 2', cantidad: 1 }], 
            totalItems: 3,
            totalPagar: 850.50
          }}>
            <Story />
          </CartContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};

export const VistaEmprendedora = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider value={{ 
          usuario: { nombre: 'Moda Artesanal', tipo_usuario: 'emprendedora' }, 
          esCliente: () => false,
          esEmprendedora: () => true,
          estaAutenticado: () => true 
        }}>
          <CartContext.Provider value={{ ...mockCartBase, items: [], totalItems: 0 }}>
            <Story />
          </CartContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};