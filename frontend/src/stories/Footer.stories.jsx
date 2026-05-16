import { Footer } from '../components/layout/Footer';
import { MemoryRouter } from 'react-router-dom';

export default {
  title: 'Componentes/Layout/Footer',
  component: Footer,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const PorDefecto = {};