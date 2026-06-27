import type { Meta } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const meta: Meta = {
  title: 'Autumn8/RadioGroup',
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: (args: any) => (
    <RadioGroup defaultValue="student" {...args}>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="student" id="r1" />
        <label htmlFor="r1" className="text-sm font-medium text-slate-600 select-none cursor-pointer">
          Student
        </label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="teacher" id="r2" />
        <label htmlFor="r2" className="text-sm font-medium text-slate-600 select-none cursor-pointer">
          Teacher
        </label>
      </div>
    </RadioGroup>
  ),
};
