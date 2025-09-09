import React from "react";
import { useLogout, useMenu, useGetIdentity } from "@refinedev/core";
import { NavLink } from "react-router-dom";
import { LogOut, Menu as MenuIcon, X, ChevronDown } from "lucide-react";
import { UserMicroProfile } from "@/components/layout/UserMicroProfile";
import { cn } from "@/utility";
import { Button, ScrollArea, Separator } from "@/components/ui";
import { User } from "@/utility/auth/userCache";

interface AdminMenuProps {
  onClose?: () => void;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({ onClose }) => {
  const { mutate: logout } = useLogout();
  const { menuItems } = useMenu();
  const { data: user } = useGetIdentity<User>();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center">
          <MenuIcon className="h-6 w-6 mr-2" />
          <span className="font-semibold">Smart Up</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-4">
          {menuItems.map((parent) => (
            <div key={parent.key} className="space-y-2">
              {/* Nagłówek grupy (klikalny – prowadzi do overview) */}
              <NavLink
                to={parent.route ?? "/"}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "text-foreground"
                  )
                }
              >
                <span className="flex items-center">
                  {parent.icon && <span className="mr-3">{parent.icon}</span>}
                  {parent.label}
                </span>
                {parent.children && parent.children.length > 0 && (
                  <ChevronDown className="h-4 w-4 opacity-60" />
                )}
              </NavLink>

              {/* Dzieci (podmenu) */}
              {parent.children && parent.children.length > 0 && (
                <div className="ml-3 border-l pl-3 space-y-1">
                  {parent.children.map((child) => (
                    <NavLink
                      key={child.key}
                      to={child.route ?? "/"}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                        )
                      }
                    >
                      {child.icon && <span className="mr-3">{child.icon}</span>}
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Profile Section */}
      <Separator />
      <UserMicroProfile className="border-b" />

      {/* Footer */}
      <div className="p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            if (onClose) onClose();
          }}
          className="w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};