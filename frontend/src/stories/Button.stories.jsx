import { Button } from '../components/common/Button';

export default {
  title: 'Componentes/Comunes/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'select', options: ['md', 'sm'] },
    disabled: { control: 'boolean' },
    onClick: { action: 'click detectado' },
  },
};

export const Primario = {
  args: {
    children: 'Botón Primario',
    variant: 'primary',
    size: 'md',
  },
};

export const Secundario = {
  args: {
    children: 'Botón Secundario',
    variant: 'secondary',
    size: 'md',
  },
};

export const Pequeño = {
  args: {
    children: 'Botón Pequeño',
    variant: 'primary',
    size: 'sm',
  },
};

export const Deshabilitado = {
  args: {
    children: 'No Clickeable',
    disabled: true,
  },
};