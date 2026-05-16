import { Switch } from '../components/common/Switch';

export default {
  title: 'Componentes/Comunes/Switch',
  component: Switch,
  argTypes: {
    checked: { control: 'boolean' },
    onChange: { action: 'interruptor accionado' },
  },
};

export const Inactivo = {
  args: {
    checked: false,
  },
};

export const Activo = {
  args: {
    checked: true,
  },
};