import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Componente Input', () => {
  test('Renderiza el input vacío con su placeholder', () => {
    render(<Input placeholder="Tu nombre" />);
    expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
  });

  test('Muestra el label de forma condicional', () => {
    render(<Input label="Correo Electrónico" />);
    expect(screen.getByText('Correo Electrónico')).toBeInTheDocument();
  });

  test('Permite escribir texto y dispara el evento onChange', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Escribe aquí" onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText('Escribe aquí');
    fireEvent.change(input, { target: { value: 'Gabriel' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  test('Bloquea la interacción cuando está deshabilitado (disabled)', () => {
    render(<Input placeholder="Deshabilitado" disabled={true} />);
    const input = screen.getByPlaceholderText('Deshabilitado');
    expect(input).toBeDisabled();
  });

  test('Muestra el mensaje de error y aplica bordes rojos', () => {
    render(<Input placeholder="Password" error="Contraseña muy corta" />);
    
    const input = screen.getByPlaceholderText('Password');
    const mensajeError = screen.getByText('Contraseña muy corta');
    
    expect(mensajeError).toBeInTheDocument();
    expect(input.className).toContain('border-error');
  });
});