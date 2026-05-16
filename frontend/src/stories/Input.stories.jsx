import { Input } from "../components/common/Input"

export default {
  title: 'Componentes/Comunes/Input',
  component: Input,
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number'],
    },
    disabled: { control: 'boolean' },
  },
};

// --- Variantes del Componente ---

export const Vacio = {
  args: {
    placeholder: 'Escribe algo aquí...',
  },
};

export const ConLabel = {
  args: {
    label: 'Nombre Completo',
    placeholder: 'Ej. Juan Pérez',
  },
};

export const ConError = {
  args: {
    label: 'Correo Electrónico',
    value: 'correo-invalido',
    error: 'El formato del correo no es válido.',
  },
};

export const Deshabilitado = {
  args: {
    label: 'Usuario',
    value: 'admin_123',
    disabled: true,
  },
};