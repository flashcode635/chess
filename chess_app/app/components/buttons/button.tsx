import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility to merge tailwind classes safely
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

// 1. Define the variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors focus:outline-none hover:shadow-lg hover:cursor-pointer disabled:opacity-50 w-fit h-fit",
  {
    variants: {
      types: {
        primary: "bg-green-600 text-white",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
      },
      size: {
        sm: "h-8 p-3 text-xs font-medium gap-0.5",
        md: "h-10 p-4 font-medium gap-1",
        lg: "h-12 p-6 text-lg font-medium gap-2",
      },
    },
    defaultVariants: {
      types: "primary",
      size: "md",
    },
  }
);

// 2. Props
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  before?: React.ReactNode;
  after?: React.ReactNode;
  children: React.ReactNode;
  disabled:boolean
}

// 3. Component
export const Button = ({
  types,
  size,
  before,
  after,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    < button disabled={disabled} className={cn(buttonVariants({ types, size }))}
      {...props} 
    >
      {before && <span>{before}</span>}
      {children}
      {after && <span>{after}</span>}
    </button>
  );
};
