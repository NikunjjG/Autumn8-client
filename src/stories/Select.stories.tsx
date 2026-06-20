import type { Meta } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const meta: Meta = {
  title: 'EduManage/Select',
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: (args: any) => (
    <Select {...args}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Ghost = {
  render: (args: any) => (
    <Select {...args}>
      <SelectTrigger variant="ghost" className="w-[240px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="high-school">High School</SelectItem>
        <SelectItem value="elementary">Elementary School</SelectItem>
        <SelectItem value="admin">Administrative</SelectItem>
      </SelectContent>
    </Select>
  ),
};
