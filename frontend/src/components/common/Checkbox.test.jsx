import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Componente Checkbox', () => {
  test('Renderiza el label correctamente', () => {
    render(<Checkbox label="Acepto los términos" />);
    expect(screen.getByText('Acepto los términos')).toBeInTheDocument();
  });

  test('Llama a onChange con "true" al hacer clic si estaba desmarcado', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Marcar" checked={false} onChange={handleChange} />);
    
    // Obtenemos el botón buscando su texto
    const boton = screen.getByText('Marcar').closest('button');
    fireEvent.click(boton);
    
    // Esperamos que se haya llamado con "true" (el inverso de false)
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  test('Llama a onChange con "false" al hacer clic si estaba marcado', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Desmarcar" checked={true} onChange={handleChange} />);
    
    const boton = screen.getByText('Desmarcar').closest('button');
    fireEvent.click(boton);
    
    expect(handleChange).toHaveBeenCalledWith(false);
  });
});