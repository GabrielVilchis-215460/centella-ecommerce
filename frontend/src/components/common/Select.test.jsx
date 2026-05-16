import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { Select } from './Select';

describe('Componente Select', () => {
  const opcionesMock = [
    { value: 'ropa', label: 'Ropa' },
    { value: 'comida', label: 'Comida' }
  ];

  test('Renderiza el placeholder y las opciones', () => {
    render(<Select placeholder="Elige categoría" options={opcionesMock} />);
    
    expect(screen.getByText('Elige categoría')).toBeInTheDocument();
    expect(screen.getByText('Ropa')).toBeInTheDocument();
    expect(screen.getByText('Comida')).toBeInTheDocument();
  });

  test('Dispara onChange al seleccionar una opción', () => {
    const handleChange = vi.fn();
    render(<Select options={opcionesMock} onChange={handleChange} />);
    
    const select = screen.getByRole('combobox');
    
    // Simulamos que el usuario elige 'comida'
    fireEvent.change(select, { target: { value: 'comida' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  test('Muestra un mensaje de error si se proporciona', () => {
    render(<Select error="Debes seleccionar una opción" />);
    expect(screen.getByText('Debes seleccionar una opción')).toBeInTheDocument();
  });

  test('Se deshabilita correctamente', () => {
    render(<Select disabled={true} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});