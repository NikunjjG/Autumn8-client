import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/ui/textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Autumn8/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'ghost'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Enter description...',
    variant: 'default',
  },
};

export const Ghost: Story = {
  args: {
    placeholder: 'Enter description (Ghost)...',
    variant: 'ghost',
  },
};
