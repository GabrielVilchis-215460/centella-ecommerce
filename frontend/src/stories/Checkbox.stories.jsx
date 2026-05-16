import { Checkbox } from '../components/common/Checkbox';

export default {
  title: 'Componentes/Comunes/Checkbox',
  component: Checkbox,
  argTypes: {
    checked: { control: 'boolean' },
    onChange: { action: 'cambio de estado' },
  },
};

export const Desmarcado = {
  args: {
    label: 'Recordar mi sesión',
    checked: false,
  },
};

export const Marcado = {
  args: {
    label: 'Acepto los Términos y Condiciones',
    checked: true,
  },
};