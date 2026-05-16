import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { Switch } from './Switch';

describe('Componente Switch', () => {
  test('Renderiza como apagado (unchecked) por defecto', () => {
    render(<Switch checked={false} />);
    const boton = screen.getByRole('button');
    
    // Verifica que tenga la clase gris de apagado
    expect(boton.className).toContain('bg-gray-200');
  });

  test('Renderiza como encendido (checked) si se le pasa la prop', () => {
    render(<Switch checked={true} />);
    const boton = screen.getByRole('button');
    
    // Verifica que tenga la clase de color principal (bg-aux)
    expect(boton.className).toContain('bg-aux');
  });

  test('Llama a onChange con el estado contrario al hacer clic', () => {
    const handleChange = vi.fn();
    // Empieza apagado
    render(<Switch checked={false} onChange={handleChange} />);
    
    const boton = screen.getByRole('button');
    fireEvent.click(boton);
    
    // Debería enviar "true" para encenderse
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});