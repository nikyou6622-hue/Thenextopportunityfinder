You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
menu.tsx
// 1. Import Dependencies
import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils'; // Make sure you have this utility function

// 2. Define Prop Types
interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  isSeparator?: boolean; // Optional separator for grouping items
}

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

interface UserProfileSidebarProps {
  user: UserProfile;
  navItems: NavItem[];
  logoutItem: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// 3. Define Animation Variants
const sidebarVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

// 4. Create the Component
export const UserProfileSidebar = React.forwardRef<HTMLDivElement, UserProfileSidebarProps>(
  ({ user, navItems, logoutItem, className }, ref) => {
    return (
      <motion.aside
        ref={ref}
        className={cn(
          'flex h-full w-full max-w-xs flex-col rounded-xl border bg-card p-4 text-card-foreground shadow-sm',
          className
        )}
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        aria-label="User Profile Menu"
      >
        {/* User Info Header */}
        <motion.div variants={itemVariants} className="flex items-center space-x-4 p-2">
          <img
            src={user.avatarUrl}
            alt={`${user.name}'s avatar`}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div className="flex flex-col truncate">
            <span className="font-semibold text-lg">{user.name}</span>
            <span className="text-sm text-muted-foreground truncate">{user.email}</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="my-4 border-t border-border" />

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1" role="navigation">
          {navItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.isSeparator && <motion.div variants={itemVariants} className="h-6" />}
              <motion.a
                href={item.href}
                variants={itemVariants}
                className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="mr-3 h-5 w-5">{item.icon}</span>
                <span>{item.label}</span>
                <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.a>
            </React.Fragment>
          ))}
        </nav>

        {/* Logout Button */}
        <motion.div variants={itemVariants} className="mt-4">
          <button
            onClick={logoutItem.onClick}
            className="group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <span className="mr-3 h-5 w-5">{logoutItem.icon}</span>
            <span>{logoutItem.label}</span>
          </button>
        </motion.div>
      </motion.aside>
    );
  }
);

UserProfileSidebar.displayName = 'UserProfileSidebar';

demo.tsx
import {
  Truck,
  Star,
  Home,
  Eye,
  Heart,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { UserProfileSidebar } from '@/components/ui/menu'; // Adjust the import path

export default function UserProfileSidebarDemo() {
  const user = {
    name: 'Emma',
    email: 'emma@nucleus-ui.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
  };

  const navItems = [
    {
      label: 'My orders',
      href: '#orders',
      icon: <Truck className="h-full w-full" />,
    },
    {
      label: 'Reviews',
      href: '#reviews',
      icon: <Star className="h-full w-full" />,
    },
    {
      label: 'Delivery addresses',
      href: '#addresses',
      icon: <Home className="h-full w-full" />,
    },
    {
      label: 'Recently viewed',
      href: '#viewed',
      icon: <Eye className="h-full w-full" />,
    },
    {
      label: 'Favorite items',
      href: '#favorites',
      icon: <Heart className="h-full w-full" />,
    },
    {
      label: 'Settings',
      href: '#settings',
      icon: <Settings className="h-full w-full" />,
      isSeparator: true, // This adds space before the settings item
    },
  ];
  
  const logoutItem = {
    label: 'Log out',
    icon: <LogOut className="h-full w-full" />,
    onClick: () => alert('Logging out...'),
  };

  return (
    <div className="flex h-[600px] w-full items-center justify-center bg-background p-10">
      <UserProfileSidebar user={user} navItems={navItems} logoutItem={logoutItem} />
    </div>
  );
}
```

Install NPM dependencies:
```bash
lucide-react, framer-motion
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
