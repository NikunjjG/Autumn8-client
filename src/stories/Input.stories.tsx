import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/input';

const meta: Meta<typeof Input> = {
  title: 'Autumn8/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'ghost'],
    },
    disabled: {
      control: 'boolean',
    },
    isError: {
      control: 'boolean',
    },
    isActive: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    variant: 'default',
  },
};

export const GhostDefault: Story = {
  args: {
    placeholder: 'Enter text (Ghost)...',
    variant: 'ghost',
  },
};

export const GhostActive: Story = {
  args: {
    value: 'Currently being edited',
    variant: 'ghost',
    isActive: true,
  },
};

export const GhostError: Story = {
  args: {
    value: 'Invalid input',
    variant: 'ghost',
    isError: true,
  },
};
