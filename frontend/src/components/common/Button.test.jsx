import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { Button } from './Button'; 

describe('Componente Button', () => {
  
  test('Renderiza correctamente el texto (children)', () => {
    render(<Button>Comprar Ahora</Button>);
    const boton = screen.getByText(/comprar ahora/i);
    expect(boton).toBeInTheDocument();
  });

  test('Aplica las clases por defecto (primary, md)', () => {
    render(<Button>Por defecto</Button>);
    const boton = screen.getByText('Por defecto');
    
    // Verifica clases de la variante primary y tamaño md
    expect(boton.className).toContain('bg-primary');
    expect(boton.className).toContain('px-10'); // tamaño md
  });

  test('Aplica las clases de las props variant y size', () => {
    render(<Button variant="secondary" size="sm">Secundario Pequeño</Button>);
    const boton = screen.getByText('Secundario Pequeño');
    
    // Verifica clases de la variante secondary y tamaño sm
    expect(boton.className).toContain('bg-[#4a4a4a]');
    expect(boton.className).toContain('px-6'); // tamaño sm
  });

  test('Aplica clases adicionales personalizadas (className)', () => {
    render(<Button className="mt-4 shadow-lg">Personalizado</Button>);
    const boton = screen.getByText('Personalizado');
    
    expect(boton.className).toContain('mt-4');
    expect(boton.className).toContain('shadow-lg');
  });

  test('Ejecuta la función onClick cuando se hace clic', () => {
    // vi.fn() crea una función falsa (mock) que nos permite saber si fue llamada
    const handleClick = vi.fn(); 
    
    render(<Button onClick={handleClick}>Click Me</Button>);
    const boton = screen.getByText('Click Me');
    
    // Simulamos el clic del usuario
    fireEvent.click(boton);
    
    // Verificamos que la función fue llamada exactamente 1 vez
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('Se deshabilita correctamente y no ejecuta onClick', () => {
    const handleClick = vi.fn();
    
    render(<Button disabled onClick={handleClick}>No Clickeable</Button>);
    const boton = screen.getByText('No Clickeable');
    
    // Verificamos el atributo HTML disabled
    expect(boton).toBeDisabled();
    
    // Simulamos el clic
    fireEvent.click(boton);
    
    // Verificamos que la función NUNCA fue llamada porque el botón estaba apagado
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('Asigna el type correcto al botón', () => {
    render(<Button type="submit">Enviar Formulario</Button>);
    const boton = screen.getByText('Enviar Formulario');
    
    // Verifica que el atributo HTML type sea 'submit' en lugar de 'button'
    expect(boton).toHaveAttribute('type', 'submit');
  });
});