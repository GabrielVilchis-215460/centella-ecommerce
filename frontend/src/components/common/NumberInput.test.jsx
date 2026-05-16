import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { NumberInput } from './NumberInput';

describe('Componente NumberInput', () => {
  test('Renderiza el label y el prefijo', () => {
    render(<NumberInput label="Cantidad" prefix="$" value={10} />);
    expect(screen.getByText('Cantidad')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  test('Incrementa y decrementa usando los botones', () => {
    const handleChange = vi.fn();
    render(<NumberInput value={5} onChange={handleChange} />);
    
    // El componente tiene 2 botones: el 0 es aumentar, el 1 es disminuir
    const botones = screen.getAllByRole('button');
    const btnSubir = botones[0];
    const btnBajar = botones[1];

    fireEvent.click(btnSubir);
    expect(handleChange).toHaveBeenCalledWith(6);

    fireEvent.click(btnBajar);
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  test('No decrementa por debajo del valor "min"', () => {
    const handleChange = vi.fn();
    // Le pasamos value=0 y min=0
    render(<NumberInput value={0} min={0} onChange={handleChange} />);
    
    const btnBajar = screen.getAllByRole('button')[1];
    fireEvent.click(btnBajar);
    
    // La función no debería llamarse porque ya está en el mínimo
    expect(handleChange).not.toHaveBeenCalled();
  });

  test('Respeta el valor "max" al escribir en el input', () => {
    const handleChange = vi.fn();
    render(<NumberInput value={5} max={10} onChange={handleChange} />);
    
    const input = screen.getByRole('spinbutton'); // input type="number"
    
    // Intentamos escribir 15, que es mayor que 10
    fireEvent.change(input, { target: { value: '15' } });
    
    // Debería topar en el maximo (10)
    expect(handleChange).toHaveBeenCalledWith(10);
  });
});