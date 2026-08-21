import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserAvatar from '../UserAvatar';

// Animation Variants
const sidebarVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 16,
    },
  },
};

export const UserProfileSidebar = React.forwardRef(
  ({ user, navItems = [], logoutItem, className }, ref) => {
    return (
      <motion.aside
        ref={ref}
        className={cn(
          'flex h-full w-full max-w-xs flex-col justify-between rounded-2xl border bg-[#111625] p-4 text-[#f8fafc] shadow-lg border-[rgba(255,255,255,0.05)]',
          className
        )}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          width: '100%',
          background: '#111625',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
          color: '#f8fafc',
          boxSizing: 'border-box'
        }}
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        aria-label="User Profile Menu"
      >
        <div>
          {/* User Info Header with strict avatar size constraint */}
          {user && (
            <motion.div 
              variants={itemVariants} 
              className="flex items-center space-x-3 p-2 mb-3"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '6px 4px 12px',
                marginBottom: '8px'
              }}
            >
              <UserAvatar
                name={user.name}
                size={44}
              />
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                <span style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2
                }}>
                  {user.name}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  color: '#8a99ad',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '2px'
                }}>
                  {user.email}
                </span>
              </div>
            </motion.div>
          )}

          {/* Separator */}
          <motion.div 
            variants={itemVariants} 
            style={{
              height: '1px',
              background: 'rgba(255, 255, 255, 0.06)',
              margin: '6px 0 14px'
            }}
          />

          {/* Navigation Links */}
          <nav role="navigation" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item, index) => {
              const isActive = item.isActive;

              return (
                <React.Fragment key={index}>
                  {item.isSeparator && (
                    <motion.div 
                      variants={itemVariants} 
                      style={{
                        height: '1px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        margin: '10px 0'
                      }}
                    />
                  )}
                  <motion.a
                    href={item.href || '#'}
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.onClick) item.onClick();
                    }}
                    variants={itemVariants}
                    className={cn(
                      "group flex items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer",
                      isActive 
                        ? "bg-[#1c2237] text-white shadow-md border-l-4 border-[#6366f1]" 
                        : "text-[#8a99ad] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f8fafc]"
                    )}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#ffffff' : '#8a99ad',
                      background: isActive ? '#1c2237' : 'transparent',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      borderLeft: isActive ? '4px solid #6366f1' : '4px solid transparent',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <span style={{
                      width: '20px',
                      height: '20px',
                      marginRight: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <ChevronRight 
                      size={14}
                      style={{
                        marginLeft: 'auto',
                        opacity: isActive ? 1 : 0,
                        color: isActive ? '#818cf8' : '#64748b',
                        transition: 'opacity 0.2s ease'
                      }}
                    />
                  </motion.a>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section (Logout Item) */}
        {logoutItem && (
          <motion.div variants={itemVariants} style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <button
              onClick={logoutItem.onClick}
              className="group flex w-full items-center rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#f43f5e] transition-colors hover:bg-[#f43f5e]/10 cursor-pointer"
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#f43f5e',
                background: 'rgba(244, 63, 94, 0.06)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{
                width: '20px',
                height: '20px',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {logoutItem.icon}
              </span>
              <span>{logoutItem.label}</span>
            </button>
          </motion.div>
        )}
      </motion.aside>
    );
  }
);

UserProfileSidebar.displayName = 'UserProfileSidebar';
