import { Select } from '../components/common/Select';

const opcionesEjemplo = [
  { value: 'ropa', label: 'Ropa y Calzado' },
  { value: 'artesanias', label: 'Artesanías' },
  { value: 'comida', label: 'Alimentos y Bebidas' },
];

export default {
  title: 'Componentes/Comunes/Select',
  component: Select,
  argTypes: {
    disabled: { control: 'boolean' },
    variant: { control: 'select', options: ['default', 'light'] },
    onChange: { action: 'opción seleccionada' },
  },
};

export const PorDefecto = {
  args: {
    label: 'Categoría del Producto',
    placeholder: 'Selecciona una categoría',
    options: opcionesEjemplo,
  },
};

export const ConError = {
  args: {
    label: 'Categoría del Producto',
    options: opcionesEjemplo,
    error: 'Este campo es requerido para registrar el artículo.',
  },
};

export const VarianteLight = {
  args: {
    label: 'Selección en Panel Oscuro',
    options: opcionesEjemplo,
    variant: 'light',
  },
  parameters: {
    backgrounds: { default: 'dark' }, // Cambia el fondo del lienzo en Storybook
  },
};