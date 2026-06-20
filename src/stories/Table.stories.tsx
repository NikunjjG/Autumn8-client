import type { Meta } from '@storybook/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const meta: Meta = {
  title: 'EduManage/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: () => (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white max-w-4xl">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">Name</TableHead>
            <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">Course</TableHead>
            <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">Fee Status</TableHead>
            <TableHead className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">Enrollment Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100">
          <TableRow className="hover:bg-slate-50/80 transition-colors">
            <TableCell className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">AJ</div>
                <span className="font-semibold text-slate-900">Alex Johnson</span>
              </div>
            </TableCell>
            <TableCell className="px-6 py-5 text-slate-600 text-xs">Computer Science 101</TableCell>
            <TableCell className="px-6 py-5">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-inset ring-emerald-600/10">Paid</span>
            </TableCell>
            <TableCell className="px-6 py-5 text-slate-500 text-xs">Aug 12, 2023</TableCell>
          </TableRow>
          <TableRow className="hover:bg-slate-50/80 transition-colors">
            <TableCell className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">SW</div>
                <span className="font-semibold text-slate-900">Sarah Williams</span>
              </div>
            </TableCell>
            <TableCell className="px-6 py-5 text-slate-600 text-xs">Digital Marketing</TableCell>
            <TableCell className="px-6 py-5">
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 ring-1 ring-inset ring-amber-600/10">Pending</span>
            </TableCell>
            <TableCell className="px-6 py-5 text-slate-500 text-xs">Aug 15, 2023</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
