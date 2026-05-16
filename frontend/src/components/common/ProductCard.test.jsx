import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { ProductCard } from './ProductCard';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    esEmprendedora: false 
  })
}));

describe('Componente ProductCard', () => {
  const productoMock = {
    nombre: 'Bolsa de Cuero Artesanal',
    precio: 450.00,
    calificacion: 4.5,
    imagen: 'https://ejemplo.com/bolsa.jpg'
  };

  test('Renderiza correctamente la información del producto', () => {
    render(<ProductCard {...productoMock} />);
    
    // Verifica el nombre
    expect(screen.getByText('Bolsa de Cuero Artesanal')).toBeInTheDocument();
    
    // Verifica el precio con su formato de 2 decimales
    expect(screen.getByText('$450.00')).toBeInTheDocument();
    
    // Verifica la calificación
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  test('Carga la imagen por defecto de placehold.co si no recibe una URL', () => {
    render(<ProductCard nombre="Sin Foto" precio={100} calificacion={5} />);
    
    const imagen = screen.getByAltText('Sin Foto');
    expect(imagen.src).toContain('placehold.co');
  });

  test('Muestra el botón "Agregar" únicamente al hacer hover con el mouse', () => {
    render(<ProductCard {...productoMock} />);
    
    // Al inicio, el botón no debe existir en la pantalla
    expect(screen.queryByText('Agregar')).not.toBeInTheDocument();
    
    // Buscamos el div principal de la tarjeta (el contenedor más cercano al texto)
    const tarjeta = screen.getByText('Bolsa de Cuero Artesanal').closest('div').parentElement;
    
    // Simulamos que el mouse entra
    fireEvent.mouseEnter(tarjeta);
    expect(screen.getByText('Agregar')).toBeInTheDocument();
    
    // Simulamos que el mouse sale
    fireEvent.mouseLeave(tarjeta);
    expect(screen.queryByText('Agregar')).not.toBeInTheDocument();
  });

  test('Ejecuta la función onClick al hacer clic en toda la tarjeta', () => {
    const handleClick = vi.fn();
    render(<ProductCard {...productoMock} onClick={handleClick} />);
    
    const tarjeta = screen.getByText('Bolsa de Cuero Artesanal').closest('div').parentElement;
    fireEvent.click(tarjeta);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});