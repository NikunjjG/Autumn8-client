import type { Meta } from '@storybook/react';
import { Checkbox } from '@/components/ui/checkbox';

const meta: Meta = {
  title: 'Autumn8/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: (args: any) => (
    <div className="flex items-center gap-3">
      <Checkbox id="chk1" {...args} />
      <label htmlFor="chk1" className="text-sm font-medium text-slate-600 select-none cursor-pointer">
        Active Status
      </label>
    </div>
  ),
};

export const Checked = {
  render: (args: any) => (
    <div className="flex items-center gap-3">
      <Checkbox id="chk2" defaultChecked {...args} />
      <label htmlFor="chk2" className="text-sm font-medium text-slate-600 select-none cursor-pointer">
        Newsletter Opt-in
      </label>
    </div>
  ),
};
